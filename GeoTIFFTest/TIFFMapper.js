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

    this.scene = reader;
    this.reader = reader;

    this.createMesh();
};


TIFFX.TIFFMapper.prototype = {

    createMesh: function () {

            console.log("TIFFMapper:createMesh");
    }

};