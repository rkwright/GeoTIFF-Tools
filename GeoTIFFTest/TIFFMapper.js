/**
 *  Various functions to map a TIFF file from the source reader.
 *
 *  @author rkwright, August 2017
 *
 */



/**
 * Constructor for the TIFFMapper "class"
 *
 * @param scene
 * @param reader
 * @constructor
 */
TIFFX.TIFFMapper = function ( scene, reader ) {

    this.scene  = scene;
    this.reader = reader;

    this.createMesh();
};


TIFFX.TIFFMapper.prototype = {

    createMesh: function () {
        console.log("TIFFMapper:createMesh");

        var image = this.reader.image;
        var height = image.getHeight();
        var width = image.getWidth();
        var deltaLat = 180.0 / (height-1);
        var deltaLon = 360.0 / (width-1);
        var x,y,z;
        var rasterData;
        var CUBE_SIZE = 0.01;
        var boxMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        var boxMesh;
        var SCALE_FACTOR = 2;

        var lat = 90;
        for (var i = 0; i < height; i++) {
            var rasterWindow = [0, i, width - 1, i + 1];    // left, top, right, bottom
            rasterData = image.readRasters({window: rasterWindow});


            var lon = 0;
            var coords = "";
            var rLat, rLon;
            for ( var j=0; j< rasterData[0].length; j++ ) {

                rLat = lat * Math.PI / 180.0;
                rLon = lon * Math.PI / 180.0;
                y = Math.sin(-rLat) * SCALE_FACTOR;
                z = Math.cos(rLat) * Math.sin(-rLon) * SCALE_FACTOR;
                x = Math.cos(rLat) * Math.cos(-rLon) * SCALE_FACTOR;

                coords += x.toFixed(2) + "," + y.toFixed(2) + "," + z.toFixed(2) + "  ";

                var boxGeometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE);
                boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                boxMesh.position.set(x, y, z);
                this.scene.add(boxMesh);

                lon += deltaLon;
            }
            //console.log( i.toFixed(0) + ": " + coords);

            lat -= deltaLat;
        }


        //var geometry = new THREE.SphereGeometry( 1, 1081, 541 );
        //var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe:true} );
        //var sphere = new THREE.Mesh( geometry, material );
        //this.scene.add( sphere );

    }
};