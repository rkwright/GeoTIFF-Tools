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
    this.globeGeom = undefined;
    this.globeMat = undefined;
    this.globeMesh = undefined;

    this.createGlobe();
};


TIFFX.TIFFMapper.prototype = {

    createGlobe: function () {
        console.log("TIFFMapper:createMesh");

        var image = this.reader.image;
        var height = image.getHeight();
        var width = image.getWidth();

        this.globeGeom = new THREE.Geometry();

        this.createVertices( image, height, width );

        this.createFaces( height, width );

        this.createMaterial();

        this.globeMesh = new THREE.Mesh( this.globeGeom, this.globeMat );
        this.globeMesh.rotation.set(Math.PI, 0, 0);

        this.scene.add( this.globeMesh );
    },

    createVertices: function( image, height, width ) {

        var EARTH_DIAMETER = 12796.0;  // km
        var deltaLat = 180.0 / (height-1) * Math.PI / 180.0;
        var deltaLon = 360.0 / (width-1) * Math.PI / 180.0;
        var x,y,z;
        var rasterData;
        var SCALE_FACTOR = 2;
        var EXAGGERATION = 50;
        //var vertArray = this.create2DArray(height);
        var max=0, min=0;

        var lat = 90 * Math.PI / 180.0;
        for (var i=0; i < height; i++ ) {
            var rasterWindow = [0, i, width - 0, i+1];    // left, top, right, bottom
            rasterData = image.readRasters({window: rasterWindow});

            //vertArray[i] = [];

            var lon = 0;
            for ( var j=rasterData[0].length-1; j>=0; j-- ) {

                var scaleFactor = SCALE_FACTOR * (rasterData[0][j] / 1000.00 * EXAGGERATION + EARTH_DIAMETER) / EARTH_DIAMETER;
                y = Math.sin(-lat) * scaleFactor;
                z = Math.cos(lat) * Math.sin(-lon) * scaleFactor;
                x = Math.cos(lat) * Math.cos(-lon) * scaleFactor;

                //vertArray[i][j] = new THREE.Vector3(x,y,z);

                max = Math.max(max, rasterData[0][j]);
                min = Math.min(min, rasterData[0][j]);

                this.globeGeom.vertices.push(new THREE.Vector3(x,y,z));

                lon += deltaLon;
            }

            lat -= deltaLat;
        }

        console.log("max: " + max.toFixed(1) + "  min: " + min.toFixed(1));
    },

    /**
     * Create all the faces of the globe by striding through the vertices.
     *
     * @param height
     * @param width
     */
    createFaces: function ( height, width ) {
        var face;
        var vertices = this.globeGeom.vertices;

        for (var i = 0; i < height - 1; i++ ) {
            var row0 = width * i;
            var row1 = width * (i + 1);

            for (var j = 0; j < width - 1; j++) {
                var v0 = row0 + j;
                var v1 = row0 + j+1;
                var v2 = row1 + j+1;
                var v3 = row1 + j;

                this.globeGeom.faces.push(new THREE.Face3(v0, v1, v2));
                this.globeGeom.faces.push(new THREE.Face3(v0, v2, v3));
            }
        }

        this.globeGeom.computeFaceNormals();
        this.globeGeom.computeVertexNormals();

    },

    createMaterial: function () {
        this.globeMat = new THREE.MeshLambertMaterial( {color: 0xffffff, wireframe:false} );
    },

    create2DArray: function (rows) {
        var arr = [];

        for (var i=0;i<rows;i++) {
            arr[i] = [];
        }

        return arr;
    }
};