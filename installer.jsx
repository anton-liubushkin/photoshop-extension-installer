/*
// Installer will copy all files
// from: ../MANUAL-INSTALLATION/panel_dir/
// to: ../CEP/extensions/panel_dir/
*/
var panelInfo = {
    "panel_dir": "com.adobe.my.awesome.panel",
    "panel_name": "My Awesome Panel",
    "panel_version": "1.0.0",
    "author": "Me",
    "contact_email": "example@example.com"
};

var messages = {
    "success": "Restart your Photoshop!\nInstallation complete. After restart you will find " + panelInfo.panel_name + " under\nWindow > Extensions > " + panelInfo.panel_name,
    "fail": "Installation Failure :-(\n------------\nPlease take a screenshot of this message and send to " + panelInfo.author + " email: " + panelInfo.contact_email + "\n------------\nPanel: " + panelInfo.panel_name + ", v" + panelInfo.panel_version + "\nPhotoshop: " + app.version + ", " + ($.os.match(/windows/i) ? "Win" : "Mac") + "\nErrors:",
    "errors": []
};

var appVersion = checkAppVersion();
if (appVersion >= 14) {
    init();
} else {
    alert("This extension requires Adobe Photoshop CC or higher.", "Wrong Version", false);
}

function init() {
    var workDirs = getWorkDirectroies();
    var panelContent = getDirectoryContent(workDirs.from);

    if (workDirs.to.exists) {
        alert("We found old version of " + panelInfo.panel_name + "\nYou need to remove it before installation.\n1. Close Photoshop\n2. After this message, you will see Photoshop extensions directory\n3. Find '" + panelInfo.panel_dir + "' folder and DELETE it\n4. Open Photoshop and try to Install again","Old version detected",false);
        workDirs.to.parent.execute();
        return false
    }

    createDirStructure(panelContent.folders, workDirs);

    copyFiles(panelContent.files, workDirs);

    if (messages.errors.length < 1) {
        /* Show success message */
        alert(messages.success, "Done!", false);
    } else {
        /* Show error message */
        var e;
        var errStr = "";
        var maxErrors = 3;
        maxErrors <= messages.errors.length ? maxErrors : messages.errors.length;
        for (e = 0; e < maxErrors; e++) {
            errStr += "\n" + messages.errors[e];
        }
        if (maxErrors < messages.errors.length) {
            errStr += "\nand " + (messages.errors.length - maxErrors) + " errors..."
        }
        alert(messages.fail + " " + errStr, "Error", false);
    }
}

function checkAppVersion() {
    var appv = parseInt(app.version, 10);
    return appv >= 14 ? appv : -1;
}

function getWorkDirectroies() {
    var d = {
        "from": new Folder((File($.fileName).path) + "/MANUAL-INSTALLATION/" + panelInfo.panel_dir),
        "to": new Folder(Folder.userData + "/Adobe/" + (appVersion === 14 ? "CEPServiceManager4" : "CEP") + "/extensions/" + panelInfo.panel_dir)
    };
    return d
}

function getDirectoryContent(_dir) {
    var j, list, item, innerFolderContent;
    var panelsContent = {
        "files": [],
        "folders": []
    };
    if (_dir.constructor === String) {
        _dir = new Folder(_dir);
    }
    list = _dir.getFiles();
    for (j = 0; j < list.length; j++) {
        item = list[j];
        if (item instanceof Folder) {
            panelsContent.folders.push(item);
            innerFolderContent = getDirectoryContent(item);
            panelsContent.files = panelsContent.files.concat(innerFolderContent.files);
            panelsContent.folders = panelsContent.folders.concat(innerFolderContent.folders);
        } else {
            panelsContent.files.push(item);
        }
    }
    return panelsContent
}

function createDirStructure(_folders, _dirs) {
    var p;
    for (p = 0; p < _folders.length; p++) {
        createDir(decodeURI(_dirs.to) + decodeURI(_folders[p].fsName).replace(_dirs.from.fsName, "").replace(/\\/g, "/"));
    }
}

function createDir(_path) {
    var res, f = _path;
    if (f.constructor === String) {
        f = new Folder(_path);
    }

    if (!f.parent.exists) {
        createDir(f.parent);
    }

    if (!f.exists) {
        res = f.create();
        if (!res) messages.errors.push("Can't create folder: " + f.fsName + "\n");
    }
}

function copyFiles(_files, _dirs) {
    var i, res, f;
    for (i = 0; i < _files.length; i++) {
        f = new File(decodeURI(_dirs.to.fsName) + decodeURI(_files[i].fsName).replace(_dirs.from.fsName, "").replace(/\\/g, "/"));
        res = _files[i].copy(f);
        if (!res) messages.errors.push("Can't copy file: " + f.fsName + "\n");
    }
}
