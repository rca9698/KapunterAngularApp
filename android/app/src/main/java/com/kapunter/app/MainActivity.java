package com.kapunter.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Capture native crashes to a file and report last run's crash to the API.
        CrashReporter.install(this);
        CrashReporter.reportPendingCrash(this);

        registerPlugin(ApkInstallerPlugin.class);
        registerPlugin(NativeSharePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
