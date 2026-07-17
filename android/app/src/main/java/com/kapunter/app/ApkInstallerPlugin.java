package com.kapunter.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.FileProvider;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "ApkInstaller")
public class ApkInstallerPlugin extends Plugin {
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void canRequestInstall(PluginCall call) {
        JSObject result = new JSObject();
        result.put("allowed", canInstallPackages());
        call.resolve(result);
    }

    @PluginMethod
    public void openInstallSettings(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        try {
            Intent intent = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Unable to open install settings: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String apkUrl = call.getString("url");
        if (apkUrl == null || apkUrl.trim().isEmpty()) {
            call.reject("Missing apk url");
            return;
        }

        if (!canInstallPackages()) {
            JSObject result = new JSObject();
            result.put("needsPermission", true);
            call.resolve(result);
            return;
        }

        executor.execute(() -> {
            HttpURLConnection connection = null;
            try {
                notifyProgress(0, "Downloading update…");

                URL url = new URL(apkUrl.trim());
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(30000);
                connection.setReadTimeout(120000);
                connection.setInstanceFollowRedirects(true);
                connection.connect();

                int code = connection.getResponseCode();
                if (code < 200 || code >= 300) {
                    call.reject("Download failed (HTTP " + code + ")");
                    return;
                }

                long total = connection.getContentLength();
                File apkFile = new File(getContext().getCacheDir(), "kapunter-update.apk");
                if (apkFile.exists() && !apkFile.delete()) {
                    call.reject("Unable to clear previous update file");
                    return;
                }

                try (InputStream input = new BufferedInputStream(connection.getInputStream());
                     FileOutputStream output = new FileOutputStream(apkFile)) {
                    byte[] buffer = new byte[8192];
                    long downloaded = 0;
                    int read;
                    int lastPct = -1;
                    while ((read = input.read(buffer)) != -1) {
                        output.write(buffer, 0, read);
                        downloaded += read;
                        if (total > 0) {
                            int pct = (int) Math.min(99, (downloaded * 100) / total);
                            if (pct != lastPct && (pct % 5 == 0 || pct > 95)) {
                                lastPct = pct;
                                notifyProgress(pct, "Downloading update… " + pct + "%");
                            }
                        }
                    }
                    output.flush();
                }

                if (!apkFile.exists() || apkFile.length() < 1024) {
                    call.reject("Downloaded APK is invalid");
                    return;
                }

                notifyProgress(100, "Installing update…");
                launchInstaller(apkFile);

                JSObject result = new JSObject();
                result.put("needsPermission", false);
                result.put("started", true);
                call.resolve(result);
            } catch (Exception e) {
                call.reject("Update failed: " + e.getMessage(), e);
            } finally {
                if (connection != null) {
                    connection.disconnect();
                }
            }
        });
    }

    private boolean canInstallPackages() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return true;
        }
        PackageManager pm = getContext().getPackageManager();
        return pm != null && pm.canRequestPackageInstalls();
    }

    private void launchInstaller(File apkFile) {
        Activity activity = getActivity();
        if (activity == null) {
            throw new IllegalStateException("Activity not available");
        }

        Uri uri = FileProvider.getUriForFile(
            getContext(),
            getContext().getPackageName() + ".fileprovider",
            apkFile
        );

        Intent intent = new Intent(Intent.ACTION_VIEW);
        intent.setDataAndType(uri, "application/vnd.android.package-archive");
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        activity.startActivity(intent);
    }

    private void notifyProgress(int percent, String message) {
        JSObject data = new JSObject();
        data.put("percent", percent);
        data.put("message", message);
        notifyListeners("downloadProgress", data);
    }
}
