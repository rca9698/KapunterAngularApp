package com.kapunter.app;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.os.Build;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * Native crash trace for the Kapunter app.
 *
 * Uncaught exceptions (e.g. a crash right after OTP submit) are written to a
 * local file before the process dies. On the next app launch the crash is
 * posted to the Kapunter API (api/ClientLog/Report) so it appears in the
 * server logs, then the local file is removed.
 */
public final class CrashReporter {
    private static final String TAG = "KapunterCrash";
    private static final String CRASH_FILE = "kapunter-crash.txt";
    private static final String REPORT_URL = "https://api.kapunter.com/api/ClientLog/Report";
    private static final int MAX_CRASH_CHARS = 8000;

    private CrashReporter() {
    }

    /** Install the uncaught-exception hook. Call once from MainActivity.onCreate. */
    public static void install(final Context context) {
        final Context appContext = context.getApplicationContext();
        final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();

        Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> {
            try {
                writeCrashFile(appContext, thread, throwable);
            } catch (Throwable ignored) {
                // Never let crash logging cause a secondary failure.
            }
            if (previous != null) {
                previous.uncaughtException(thread, throwable);
            }
        });
    }

    /** Send any crash captured on a previous run. Call from MainActivity.onCreate. */
    public static void reportPendingCrash(final Context context) {
        final Context appContext = context.getApplicationContext();
        new Thread(() -> {
            try {
                File file = new File(appContext.getFilesDir(), CRASH_FILE);
                if (!file.exists()) {
                    return;
                }

                String crashText = readFile(file);
                if (crashText.isEmpty()) {
                    //noinspection ResultOfMethodCallIgnored
                    file.delete();
                    return;
                }

                if (postToApi(appContext, crashText)) {
                    //noinspection ResultOfMethodCallIgnored
                    file.delete();
                    Log.i(TAG, "Previous crash reported to API.");
                }
            } catch (Throwable t) {
                Log.w(TAG, "Unable to report previous crash: " + t.getMessage());
            }
        }, "kapunter-crash-report").start();
    }

    private static void writeCrashFile(Context context, Thread thread, Throwable throwable) throws Exception {
        StringWriter stackWriter = new StringWriter();
        throwable.printStackTrace(new PrintWriter(stackWriter));
        String stack = stackWriter.toString();
        if (stack.length() > MAX_CRASH_CHARS) {
            stack = stack.substring(0, MAX_CRASH_CHARS);
        }

        String content = "thread=" + thread.getName()
            + "\nappVersion=" + appVersion(context)
            + "\nandroid=" + Build.VERSION.RELEASE + " (SDK " + Build.VERSION.SDK_INT + ")"
            + "\ndevice=" + Build.MANUFACTURER + " " + Build.MODEL
            + "\nmessage=" + String.valueOf(throwable.getMessage())
            + "\n" + stack;

        File file = new File(context.getFilesDir(), CRASH_FILE);
        try (FileWriter writer = new FileWriter(file, false)) {
            writer.write(content);
            writer.flush();
        }
        Log.e(TAG, "Uncaught exception captured:\n" + content);
    }

    private static boolean postToApi(Context context, String crashText) {
        HttpURLConnection connection = null;
        try {
            String message = crashText;
            int newline = crashText.indexOf("\nmessage=");
            if (newline >= 0) {
                int end = crashText.indexOf('\n', newline + 1);
                message = crashText.substring(newline + 9, end > 0 ? end : crashText.length());
            }

            JSONObject body = new JSONObject();
            body.put("level", "error");
            body.put("message", "NATIVE CRASH: " + message);
            body.put("stack", crashText);
            body.put("context", "android-uncaught-exception");
            body.put("platform", "android");
            body.put("appVersion", appVersion(context));
            body.put("url", "app://com.kapunter.app");

            byte[] payload = body.toString().getBytes(StandardCharsets.UTF_8);

            connection = (HttpURLConnection) new URL(REPORT_URL).openConnection();
            connection.setRequestMethod("POST");
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(15000);
            connection.setDoOutput(true);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setFixedLengthStreamingMode(payload.length);

            try (OutputStream out = connection.getOutputStream()) {
                out.write(payload);
                out.flush();
            }

            int code = connection.getResponseCode();
            return code >= 200 && code < 300;
        } catch (Exception e) {
            Log.w(TAG, "Crash report POST failed: " + e.getMessage());
            return false;
        } finally {
            if (connection != null) {
                connection.disconnect();
            }
        }
    }

    private static String readFile(File file) throws Exception {
        StringBuilder builder = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null && builder.length() < MAX_CRASH_CHARS) {
                builder.append(line).append('\n');
            }
        }
        return builder.toString().trim();
    }

    private static String appVersion(Context context) {
        try {
            PackageInfo info = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
            return info.versionName + " (" + info.versionCode + ")";
        } catch (Exception e) {
            return "unknown";
        }
    }
}
