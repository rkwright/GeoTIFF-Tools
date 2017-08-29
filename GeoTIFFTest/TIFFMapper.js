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
    this.globeMat  = undefined;
    this.globeWire = undefined;
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

        //this.globeGeom = new THREE.SphereGeometry(1.5, 3, 2);

        this.createMaterial();

        //this.globeMesh = THREE.SceneUtils.createMultiMaterialObject(
        //    this.globeGeom, [ this.globeMat, this.globeWire ] );

        this.globeMesh = new THREE.Mesh( this.globeGeom, this.globeMat );

        this.globeMesh.rotation.set(Math.PI, 0, 0);

        this.scene.add( this.globeMesh );
    },

    testLatLon: function() {

        var lat,lon;
        var latD,lonD;
        for ( var j=0; j<3; j++ ) {
            lat = -Math.PI/2 + j * Math.PI/2;
            for (var i = 0; i < 9; i++) {
                lon = Math.PI / 4 * i;
                var vec = this.calcXYZFromLatLon( lat, lon, 2 );

                latD = lat * 180/Math.PI;
                lonD = lon * 180/Math.PI;
                console.log("lat: " + latD.toFixed(1) + " lon: " + lonD.toFixed(1) +
                    " coords: " + vec[0].toFixed(2) + ", " +vec[1].toFixed(2) + ", " +vec[2].toFixed(2));
            }
        }
    },

    calcXYZFromLatLon: function ( lat, lon, radius ) {
        var phi   = Math.PI/2 - lat;
        var theta = lon + Math.PI;

        x = -(radius * Math.sin(phi) * Math.cos(theta));
        z = (radius * Math.sin(phi) * Math.sin(theta));
        y = (radius * Math.cos(phi));

        return [x,y,z];
    },

    createVertices: function( image, height, width ) {

        var EARTH_DIAMETER = 12796.0;  // km
        var deltaLat = 180.0 / (height-1) * Math.PI / 180.0;
        var deltaLon = 360.0 / (width-1) * Math.PI / 180.0;
        var x,y,z;
        var rasterData;
        var SCALE_FACTOR = 2;
        var EXAGGERATION = 100;
        var max=0, min=0;
        var k = 0;

       // this.testLatLon();

        var lat = 90 * Math.PI / 180.0;
        var vec;
        for (var i=0; i < height; i++ ) {
            var rasterWindow = [0, i, width - 0, i+1];    // left, top, right, bottom
            rasterData = image.readRasters({window: rasterWindow});

            var lon = 0;
            for ( var j=rasterData[0].length-1; j>=0; j-- ) {
            //for ( var j=0; j<rasterData[0].length; j++ ) {

                // instead of using the last *real* value, use the first again so it meshes
                if ( j === 0 )
                    k = rasterData[0].length-1;
                else
                    k = j;

                // from stackoverflow
                //x = Math.cos(lat) * Math.sin(-lon);
                //y = Math.cos(lat) * Math.cos(-lon);
                //z = Math.sin(-lat);

                //x = Math.cos(lat) * Math.cos(-lon) * scaleFactor;
                //y = Math.sin(-lat) * scaleFactor;
                //z = Math.cos(lat) * Math.sin(-lon) * scaleFactor;

                //x = r cos(long) sin(lat)
                //y = r sin(long) sin(lat)
                //z = r cos(lat)

                var radius = SCALE_FACTOR * (rasterData[0][k] / 1000.00 * EXAGGERATION + EARTH_DIAMETER) / EARTH_DIAMETER;

                //x = Math.sin(lon) * Math.cos(lat) * scaleFactor;
                //y = Math.sin(lon) * Math.sin(lat) * scaleFactor;
                //z = Math.cos(lon) * scaleFactor;

                // see: http://www.mathworks.de/help/toolbox/aeroblks/llatoecefposition.html
                //x = scaleFactor * Math.cos(lat) * Math.cos(lon);
                //z = scaleFactor * Math.cos(lat) * Math.sin(lon);
                //y = scaleFactor * Math.sin(lat);

                // from https://stackoverflow.com/questions/28365948/javascript-latitude-longitude-to-xyz-position-on-earth-threejs

                /*
                radius = 2;
                var vec = this.calcXYZFromLatLon( 0, 0, radius );
                console.log("vec3: " + vec[0].toFixed(2) + ", " +vec[1].toFixed(2) + ", " +vec[2].toFixed(2));
                vec = this.calcXYZFromLatLon( Math.PI/2, 0, radius );
                console.log("vec3: " + vec[0].toFixed(2) + ", " +vec[1].toFixed(2) + ", " +vec[2].toFixed(2));
                vec = this.calcXYZFromLatLon( -Math.PI/2, 0, radius );
                console.log("vec3: " + vec[0].toFixed(2) + ", " +vec[1].toFixed(2) + ", " +vec[2].toFixed(2));
                vec = this.calcXYZFromLatLon( 0, Math.PI, radius );
                console.log("vec3: " + vec[0].toFixed(2) + ", " +vec[1].toFixed(2) + ", " +vec[2].toFixed(2));
                */
                max = Math.max(max, rasterData[0][j]);
                min = Math.min(min, rasterData[0][j]);

                vec = this.calcXYZFromLatLon(lat, lon);
                this.globeGeom.vertices.push(this.calcXYZFromLatLon(new THREE.Vector3(vec[0], vec[1], vec[2])));

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

        for (var i = 0; i < height - 1; i++ ) {
            var i0 = width * i;
            var i1 = width * (i + 1);

            var i0v = i / height;
            var i1v = (i+1) / height;

            for (var j = 0; j < width - 1; j++) {
                var v0 = i0 + j;
                var v1 = i0 + j+1;
                var v2 = i1 + j+1;
                var v3 = i1 + j;

                var j0u = j /width;
                var j1u = (j+1) / width;

                var v0uv = new THREE.Vector2( j0u, i0v );
                var v1uv = new THREE.Vector2( j1u, i0v );
                var v2uv = new THREE.Vector2( j1u, i1v );
                var v3uv = new THREE.Vector2( j0u, i1v );

                this.globeGeom.faces.push(new THREE.Face3(v0, v1, v2));
                this.globeGeom.faces.push(new THREE.Face3(v0, v2, v3));

                this.globeGeom.faceVertexUvs[0].push([v0uv, v1uv, v2uv]);
                this.globeGeom.faceVertexUvs[0].push([v0uv, v2uv, v3uv]);
            }
        }

        this.globeGeom.computeFaceNormals();
        this.globeGeom.computeVertexNormals();

    },

    createMaterial: function () {

        //this.globeMat = new THREE.MeshPhongMaterial( {color: 0xffffff, wireframe:false} );
        this.globeWire = new THREE.MeshPhongMaterial( {color: 0xffff00, wireframe:true} );
        var textureLoader = new THREE.TextureLoader();
        this.globeMat = new THREE.MeshPhongMaterial({ color: '#ffffff' });
        var pThis = this;
        textureLoader.load( "../data/8081-earthmap4k.jpg", function( texture ) {
            pThis.globeMat.map = texture;
            pThis.globeMat.needsUpdate = true;
        } );
    }
};