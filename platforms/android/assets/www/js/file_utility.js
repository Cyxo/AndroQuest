function preload(res_dir, nextfunc, errorfunc){
	let images = {}
	let c = document.createElement("CANVAS");
	
	function travelDir(directory){
		let dirReader = directory.createReader();
		dirReader.readEntries(function(subdirs){
			subdirs.forEach(function(entry){
				if (entry.isDirectory){
					let path = entry.toURL().replace(res_dir.toURL(),"").split("/");
					let a = images;
					for (var i = 0; i < path.length - 2; i++){
						a = a[path[i]];
					}
					a[entry.name] = {};
					travelDir(entry);
				} else if (entry.name.substr(entry.name.length - 4, 4) == ".bmp"){
					loadres(entry);
				}
			});
		}, errorfunc);
	}
	
	travelDir(res_dir);
	
	function loadres(file){
		let a = images;
		let path = file.toURL().replace(res_dir.toURL(),"").split("/");
		for (var i = 0; i < path.length - 1; i++){
			a = a[path[i]];
		}
		a[file.name] = file.name;
	}
}