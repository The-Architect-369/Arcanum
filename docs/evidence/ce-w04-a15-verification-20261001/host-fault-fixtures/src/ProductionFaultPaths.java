import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import org.arcanum.nativehost.update.*;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.file.*;
import javax.net.ssl.HttpsURLConnection;
import java.security.cert.Certificate;

/** Executes compiled production staging/callback paths with isolated host adapters. */
public final class ProductionFaultPaths {
  static final String OP="11111111-2222-4333-8444-555555555555";
  static final String ORIGIN="https://updates.the-arcanum.net/updates/a15-settlement-verification/";
  static byte[] manifest;
  static String mode;
  static int requests;
  static int tests;
  static void check(boolean condition,String message) { if(!condition)throw new AssertionError(message); }
  static final class Connection extends HttpsURLConnection {
    Connection(URL url){super(url);}
    public void connect(){} public void disconnect(){} public boolean usingProxy(){return false;}
    public String getCipherSuite(){return "host-fixture";}
    public Certificate[] getLocalCertificates(){return null;} public Certificate[] getServerCertificates(){return new Certificate[0];}
    public int getResponseCode(){return 200;}
    public String getHeaderField(String key){return key.equalsIgnoreCase("Cache-Control")?"no-store, max-age=0":null;}
    public long getContentLengthLong(){return url.getPath().endsWith("manifest.json")?manifest.length:4632073;}
    public InputStream getInputStream(){
      boolean isManifest=url.getPath().endsWith("manifest.json");
      if(isManifest&&!mode.equals("manifest-truncated"))return new ByteArrayInputStream(manifest);
      byte[] bytes=isManifest?manifest:new byte[128];
      return new InputStream(){int cursor;
        public int read()throws IOException{if(cursor>=64)throw new IOException("fixture transfer lost after partial bytes");return bytes[cursor++];}
        public int read(byte[] b,int off,int len)throws IOException{if(cursor>=64)throw new IOException("fixture transfer lost after partial bytes");int n=Math.min(len,64-cursor);System.arraycopy(bytes,cursor,b,off,n);cursor+=n;return n;}
      };
    }
  }
  static void staging(Path root,String selected,boolean orphan)throws Exception {
    mode=selected;requests=0;
    Path files=Files.createDirectory(root.resolve(selected));Path update=Files.createDirectory(files.resolve("own-package-update"));
    Path unrelated=files.resolve("synthetic-participant-sentinel");Files.writeString(unrelated,"synthetic fixture only");
    Path previous=update.resolve("candidate.apk");Files.writeString(previous,"previous synthetic staged bytes");
    if(orphan)Files.writeString(update.resolve("candidate.partial"),"orphaned synthetic partial");
    boolean failed=false;
    if(selected.equals("thread-interrupted"))Thread.currentThread().interrupt();
    try{new OwnPackageDistribution(new Context(files.toFile())).inspectAndStage(ORIGIN+"manifest.json",ORIGIN+"candidate.apk");}
    catch(Exception expected){failed=true;}
    finally{Thread.interrupted();}
    check(failed,"staging must fail");
    check(!Files.exists(update.resolve("manifest.partial")),"manifest partial retained");
    check(!Files.exists(update.resolve("candidate.partial")),"APK partial retained");
    check(Files.readString(previous).equals("previous synthetic staged bytes"),"prior artifact overwritten");
    check(Files.readString(unrelated).equals("synthetic fixture only"),"unrelated file modified");
    check(!Files.exists(update.resolve("attempt.json")),"staging fabricated installation journal");
    check(requests==(selected.equals("manifest-truncated")||selected.equals("thread-interrupted")?1:2),"unexpected network/submission requests");tests++;
  }
  static JSONObject identity(int version,char digest){return new JSONObject().put("applicationId","org.arcanum.nativehost").put("versionCode",version).put("apkSha256",String.valueOf(digest).repeat(64)).put("signerSha256","b".repeat(64));}
  static void callback(Path root,int status,String expected,boolean mismatch)throws Exception {
    Path files=Files.createTempDirectory(root,"callback-");Path update=Files.createDirectory(files.resolve("own-package-update"));Path journal=update.resolve("attempt.json");
    JSONObject seed=new JSONObject().put("operationId",OP).put("prior",identity(24,'a')).put("target",identity(25,'c')).put("sessionId",17).put("state","SUBMITTED").put("observation","synthetic seed").put("authorityEffect","none");
    Files.writeString(journal,seed.toString());
    Intent intent=new Intent().setAction("org.arcanum.nativehost.UPDATE_RESULT."+OP).putExtra("operationId",OP).putExtra(PackageInstaller.EXTRA_SESSION_ID,mismatch?18:17);
    if(status!=Integer.MIN_VALUE)intent.putExtra(PackageInstaller.EXTRA_STATUS,status);
    OwnPackageInstaller installer=new OwnPackageInstaller(new Context(files.toFile()));
    check(installer.callback(intent)==null,"failure callback manufactured confirmation");
    OwnPackageInstaller.Attempt actual=new OwnPackageInstaller(new Context(files.toFile())).read();
    check(actual!=null&&actual.getOperationId().equals(OP)&&actual.getSessionId()==17,"original journal identity lost");
    check(actual.getState().name().equals(expected),"wrong persisted state: "+actual.getState());
    check(actual.getPrior().getVersionCode()==24&&actual.getTarget().getVersionCode()==25,"identity rewritten");
    OwnPackageUpdatePolicy.Identity target=new OwnPackageUpdatePolicy.Identity("org.arcanum.nativehost",25,"c".repeat(64),"b".repeat(64));
    OwnPackageDistribution.Staged staged=new OwnPackageDistribution.Staged(update.resolve("candidate.apk").toFile(),new OwnPackageUpdatePolicy.Inspection(target,100,true,true),"d".repeat(64));
    boolean blocked=false;try{installer.submit(staged);}catch(IllegalArgumentException e){blocked=e.getMessage().contains("Reconcile the previous attempt first");}
    check(blocked,"failure/pending journal permitted fresh submission");tests++;
  }
  public static void main(String[] args)throws Exception {
    manifest=Files.readAllBytes(Path.of(args[0]));Path root=Files.createTempDirectory("a15-isolated-fault-");
    URL.setURLStreamHandlerFactory(protocol->protocol.equals("https")?new URLStreamHandler(){protected URLConnection openConnection(URL url){requests++;check(url.getHost().equals("updates.the-arcanum.net"),"unexpected origin");return new Connection(url);}}:null);
    staging(root,"manifest-truncated",false);staging(root,"apk-truncated",false);staging(root,"thread-interrupted",false);staging(root,"orphan-partial",true);
    for(int status:new int[]{PackageInstaller.STATUS_FAILURE,PackageInstaller.STATUS_FAILURE_BLOCKED,PackageInstaller.STATUS_FAILURE_INVALID,PackageInstaller.STATUS_FAILURE_CONFLICT,PackageInstaller.STATUS_FAILURE_STORAGE,PackageInstaller.STATUS_FAILURE_INCOMPATIBLE,PackageInstaller.STATUS_FAILURE_TIMEOUT})callback(root,status,"FAILED",false);
    callback(root,PackageInstaller.STATUS_FAILURE_ABORTED,"CANCELLED",false);callback(root,Integer.MIN_VALUE,"UNKNOWN",false);callback(root,-99,"UNKNOWN",false);callback(root,PackageInstaller.STATUS_FAILURE,"SUBMITTED",true);
    System.out.println("PASS "+tests+" isolated production-path fault cases; no Android device actions or real network requests");
  }
}
