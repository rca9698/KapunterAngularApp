package com.kapunter.app;

import android.content.Intent;
import android.app.Activity;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NativeShare")
public class NativeSharePlugin extends Plugin {

    @PluginMethod
    public void share(PluginCall call) {
        Activity activity = getActivity();
        if (activity == null) {
            call.reject("Activity not available");
            return;
        }

        String title = call.getString("title", "Kapunter");
        String text = call.getString("text", "");
        String url = call.getString("url", "");
        String dialogTitle = call.getString("dialogTitle", "Share via");

        StringBuilder body = new StringBuilder();
        if (text != null && !text.trim().isEmpty()) {
            body.append(text.trim());
        }
        if (url != null && !url.trim().isEmpty()) {
            String trimmedUrl = url.trim();
            if (body.indexOf(trimmedUrl) < 0) {
                if (body.length() > 0) {
                    body.append("\n\n");
                }
                body.append(trimmedUrl);
            }
        }

        if (body.length() == 0) {
            call.reject("Nothing to share");
            return;
        }

        try {
            Intent sendIntent = new Intent(Intent.ACTION_SEND);
            sendIntent.setType("text/plain");
            sendIntent.putExtra(Intent.EXTRA_SUBJECT, title != null ? title : "Kapunter");
            sendIntent.putExtra(Intent.EXTRA_TEXT, body.toString());

            Intent chooser = Intent.createChooser(sendIntent, dialogTitle);
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            activity.startActivity(chooser);
            call.resolve();
        } catch (Exception e) {
            call.reject("Unable to open share sheet: " + e.getMessage(), e);
        }
    }
}
