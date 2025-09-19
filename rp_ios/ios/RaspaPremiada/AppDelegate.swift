import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import OneSignalFramework


@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "RaspaPremiada",
      in: window,
      launchOptions: launchOptions
    )

    // INICIO, qualquer erro retirar esse trecho de codigo do onesignal e seguir com a implementacao de inicializacao pelo App.js do projeto
    //inicializacao do onesignal, added
    OneSignal.Debug.setLogLevel(.LL_VERBOSE)

    //Inicialização Nativa. added
    OneSignal.initialize("8a665c1f-f02f-4cf1-a06a-aa18cd41ae69", withLaunchOptions: launchOptions)
    // ---- FIM ONESIGNAL ----

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
