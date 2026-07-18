package com.kapunter.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.lang.reflect.Method;
import java.util.List;

/**
 * Reports whether the default FirebaseApp is initialized (i.e. a valid
 * google-services.json was packaged into this build).
 *
 * PushNotifications.register() crashes the whole app with an uncaught
 * IllegalStateException ("Default FirebaseApp is not initialized") when
 * Firebase is not configured — Capacitor rethrows plugin exceptions as
 * RuntimeException, killing the process right after login. The web layer
 * must call this check first and skip push registration when unavailable.
 *
 * Uses reflection because firebase-common is only on the runtime classpath
 * (pulled in by @capacitor/push-notifications), not the compile classpath.
 */
@CapacitorPlugin(name = "FirebaseStatus")
public class FirebaseStatusPlugin extends Plugin {

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean available = false;
        try {
            Class<?> firebaseAppClass = Class.forName("com.google.firebase.FirebaseApp");
            Method getApps = firebaseAppClass.getMethod("getApps", android.content.Context.class);
            List<?> apps = (List<?>) getApps.invoke(null, getContext().getApplicationContext());
            available = apps != null && !apps.isEmpty();
        } catch (Throwable ignored) {
            available = false;
        }
        JSObject result = new JSObject();
        result.put("available", available);
        call.resolve(result);
    }
}
