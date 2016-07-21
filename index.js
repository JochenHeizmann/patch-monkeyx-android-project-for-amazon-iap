var fs = require('fs');
var parseString = require('xml2js').parseString;

var extract = function(source, begin, end) {
    var idxStart = source.indexOf(begin);
    var idxEnd = source.indexOf(end, idxStart);
    return source.substring(idxStart, idxEnd + end.length)
}

var addImports = function(source) {
    var imports = ['import android.app.*;',
        'import android.os.*;',
        'import android.app.*;',
        'import android.media.*;',
        'import android.view.*;',
        'import android.graphics.*;',
        'import android.content.*;',
        'import android.util.*;',
        'import android.hardware.*;',
        'import android.widget.*;',
        'import android.view.inputmethod.*;',
        'import android.content.res.*;',
        'import android.opengl.*;',

        'import java.lang.Math;',
        'import java.lang.reflect.Array;',
        'import java.util.Vector;',
        'import java.text.NumberFormat;',
        'import java.text.ParseException;',
        'import java.io.*;',
        'import java.nio.*;',
        'import java.net.*;',
        'import java.util.*;',
        'import java.text.*;',
        'import java.lang.reflect.*;',
        'import javax.microedition.khronos.opengles.GL10;',
        'import javax.microedition.khronos.egl.EGLConfig;',
        'import android.text.*;'];

        return source + '\n' + imports.join('\n');
}

if (process.argv.length <= 2) {
    console.log("Missing Argument: Android Project Directory");
    process.exit();
}

var directory = process.argv[2];

var xml = fs.readFileSync(directory + '/AndroidManifest.xml','utf8');
parseString(xml, function (err, result) {
    var package = result.manifest.$.package;
    var appDir = directory + '/src/' + package.replace(/\./g, '/');

    var monkeyGame = fs.readFileSync(appDir + '/MonkeyGame.java', 'utf8');

    /************ AndroidGame.java ************************/

    var source = extract(monkeyGame, 'class AndroidGame extends Activity{', '\n}\n');
    monkeyGame = monkeyGame.replace(source, '');

    var header = "package " + package + ";"
    header = addImports(header);
    header += '\n' + 'import ' + package + '.BBAndroidGame;';
    var source = header + '\n' + 'public ' + source;
    fs.writeFileSync(appDir + '/AndroidGame.java', source);

    /************ BBAndroidGame.java ************************/

    var source = extract(monkeyGame, 'class BBAndroidGame extends BBGame implements GLSurfaceView.Renderer,SensorEventListener{', '\n}\n');
    monkeyGame = monkeyGame.replace(source, '');

    var header = "package " + package + ";"
    header = addImports(header);
    header += '\n' + 'import ' + package + '.BBGame;';
    var source = header + '\n' + 'public ' + source;
    fs.writeFileSync(appDir + '/BBAndroidGame.java', source);

    /************ BBGame.java ************************/

    var source = extract(monkeyGame, 'abstract class BBGame{', '\n}\n');
    monkeyGame = monkeyGame.replace(source, '');

    var header = "package " + package + ";"
    header = addImports(header);
    header += '\n' + 'import ' + package + '.MonkeyConfig;';
    header += '\n' + 'import ' + package + '.BBGameDelegate;';
    var source = header + '\n' + 'public ' + source;
    fs.writeFileSync(appDir + '/BBGame.java', source);

    /************ BBGameDelegate.java ************************/

    var source = extract(monkeyGame, 'class BBGameDelegate{', '\n}\n');
    monkeyGame = monkeyGame.replace(source, '');

    var header = "package " + package + ";"
    var source = header + '\n' + 'public ' + source;
    fs.writeFileSync(appDir + '/BBGameDelegate.java', source);

    /************ MonkeyConfig.java ************************/

    var source = extract(monkeyGame, 'class MonkeyConfig{', '\n}');
    monkeyGame = monkeyGame.replace(source, '');

    var header = "package " + package + ";"
    var source = header + '\n' + 'public ' + source;
    fs.writeFileSync(appDir + '/MonkeyConfig.java', source);

    /**** MonekyGame.java *****/

    var imports = [
        '',
        'import ' + package + '.BBGame;',
        'import ' + package + '.BBGameDelegate;',
        'import ' + package + '.BBAndroidGame;',
        'import ' + package + '.AndroidGame;',
        'import ' + package + '.MonkeyConfig;',
        ''
        ].join('\n');

    monkeyGame = monkeyGame.replace("//\${IMPORTS_END}", imports);
    fs.writeFileSync(appDir + '/MonkeyGame.java', monkeyGame);
});
