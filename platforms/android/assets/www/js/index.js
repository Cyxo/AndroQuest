/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

function generalError(err){
	alert(err.message);
}

function dataDownloadError(err){
	alert("ArRgrgh ! Impossible de télécharger le fichier ! Parlez-en au créateur du jeu au plus vite !");
}

function playsolo(){
	alert("Bon, là le jeu est sensé démarrer, mais déjà d'avoir ça, c'est pas mal, non ? :D")
}

function exitFromApp()
{
	navigator.app.exitApp();
}

function game(res_dir){
	// La fonction game c'est juste l'initialisation
	// Chargement de toutes les données du menu :
	var res = res_dir.toURL();
	$("head").prepend("<style type=\"text/css\">" + 
                                "@font-face {\n" +
                                    "\tfont-family: \"QuestMain\";\n" + 
                                    "\tsrc: url('" + res + "font/0.ttf');\n" + 
                                "}\n" + 
                                    "\t.mainfont {\n" + 
                                    "\tfont-family: QuestMain !important;\n" + 
									"\tfont-size: 4em;\n" +
                                "}\n" + 
                            "</style>");
	$("#mainmenu").show();
	$("#title").hide();
	$("#mainmenu").css("background-image","url(" + res + "hud/27.bmp)");
	$(".app").css("background-image","url(" + res + "background/0.bmp)");
	
	// Ajout des evt jquery
	$("#playsolo").click(playsolo);
	$("#exitapp").click(exitFromApp);
	
	preload(res_dir, function(images){
		ressources = images;
		alert(JSON.stringify(ressources));
	}, generalError);
}

var ressources = {};

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {		
		var permissions = cordova.plugins.permissions;
		permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function( status ){
			if ( !status.hasPermission ) {
				alert("Vous devez m'autoriser l'accès aux fichiers pour que je télécharge les données de Quest. Merci !");
			}
		});
		
		resolveLocalFileSystemURL(cordova.file.externalRootDirectory, function (rootDirEntry) {
			rootDirEntry.getDirectory('Quest', { create: true }, function (dirEntry) {
				dirEntry.getDirectory('data', { create: true }, function (subDirEntry) {
					subDirEntry.getFile("data.txt", {exclusive: false}, function(){ game(subDirEntry); }, 
						function gotFileEntry(fileEntry) {
							var sPath = subDirEntry.toURL();
							var networkState = navigator.connection.type;
							
							subDirEntry.getFile("data.zip", { create: true, exclusive: false}, function(fe){
								fe.remove();
							}, generalError);
							
							if (networkState != Connection.NONE && networkState != Connection.UNKNOWN){
								$("#downloading").show();
								var fileTransfer = new FileTransfer();
								fileTransfer.download(
									"http://paul.forveille.free.fr/data.zip",
									sPath + "data.zip",
									function(theFile) {
										$("#downloading").hide();
										$("#extracting").show();
										zip.unzip(theFile.toURL(), sPath, function(){
											$("#extracting").hide();
											theFile.remove();
											subDirEntry.getFile("data.txt", { create: true, exclusive: false}, function(fe){
												var jDefaultParam = {
													"controller": "joystick"
												};
												var sToSave = JSON.stringify(jDefaultParam);
												fe.createWriter(function(writer){
													writer.write(sToSave);
													alert("Tout est parfait !");
													game(subDirEntry);
												}, generalError);
											}, generalError);
										}, function (progressEvent) {
											$( "#progressbar" ).progressbar({"value" : Math.round((progressEvent.loaded / progressEvent.total) * 100)});
											$("#extractv").html(Math.round((progressEvent.loaded / progressEvent.total) * 100) + "%");
										});
									}, dataDownloadError
								);
							} else {
								$("#nointernet").show();
								alert("Connectez-vous à Internet, sinon je ne peux pas télécharger les données !");
							}
						});
				}, generalError);
			}, generalError);
		});
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        
    }
};

app.initialize();