'use strict';

/**
 * @ngdoc service
 * @name itemMirrorAngularDemoApp.itemMirror
 * @description
 * # itemMirror
 *
 * The service that handles all of the data when it comes to the
 * itemMirror object. This data can then be accessed by any
 * controller and used to display the data in a variety of ways. It
 * also wraps the asynchronous methods in promises for better
 * compatability with Angular and more overall flexibility.
 */
angular.module('itemMirrorAngularDemoApp')
  .factory('itemMirror', ['dropboxAuth', '$q', function (dropboxAuth, $q) {
    // This variable represents the current itemMirror that the
    // service will display data for. To keep things simple, we're
    // just going to handle dealing with one mirror at a time rather
    // than multiple mirrors. This will be initially set to the root
    // mirror.
    var mirror;

    // This array is used to keep track of all created mirrors,
    // initially consisting of just the root mirror. This allows us to
    // lookup mirrors that have been previously constructed and set
    // the mirror rather than constructing a completely new object
    // each time. Very useful for navigation.
    var mirrors;

    // This variable is an array of wrappers that can be used for data
    // binding associations. For two-way data-binding, a get and set
    // function needs to be defined using the appropriate
    // variables. For one way, you can just set a property
    var associations;

    //Added by Jane
    //an object of mirrorAndAssoc, with the same order as mirrors
    //key is guid of the association of the mirror, value is mirrorAndAssoc
    //for root mirror, key is "root"
    //mirrorAndAssoc is an array of two element: mirror and associations
    var mirrorsAndAssocs;
    // An object to track whether the mirror of an association is ready
    // Does not contain the root mirror
    // key is the guid, value is true or false
    var isCurMirrorReady;
    //--Added by Jane
    


    // This is the association wrapping function. In order to allow data
    // binding for custom namespace attributes they must be manually inserted
    // here. For writable attributes a getter / setter must be defined.
    //
    // TODO: Create an injection function that will add to the wrappers so
    // that they can be defined outside of this file, allowing a separation of
    // core item mirror attributes and namespace attributes.
    function assocWrapper(guid) {

      var result = mirror.getAssociationNamespaceAttribute('tags', guid, 'im-angular-demo');
      var tags = result ? JSON.parse(result) : {};
      function saveTags() {
        mirror.setAssociationNamespaceAttribute('tags', JSON.stringify(tags), guid, 'im-angular-demo');
      }

      return {
        guid: guid,
        get displayText(){ return mirror.getAssociationDisplayText(guid); },
        set displayText(txt){ mirror.setAssociationDisplayText(guid, txt); },
        localItem: mirror.getAssociationLocalItem(guid),
        associatedItem: mirror.getAssociationAssociatedItem(guid),
        isGrouping: mirror.isAssociationAssociatedItemGrouping(guid),
        isPhantom: mirror.isAssociationPhantom(guid),

        // Simple plain text attribute that stores a color for a given association
        get customColor(){ return mirror.getAssociationNamespaceAttribute('color', guid, 'im-angular-demo'); },
        set customColor(color){ mirror.setAssociationNamespaceAttribute('color', color, guid, 'im-angular-demo'); },
        
        get borderColor(){ return mirror.getAssociationNamespaceAttribute('bcolor', guid, 'im-angular-demo'); },
        set borderColor(bcolor){ mirror.setAssociationNamespaceAttribute('bcolor', bcolor, guid, 'im-angular-demo'); },

        
        get positionX(){ return mirror.getAssociationNamespaceAttribute('posX', guid, 'im-angular-demo'); },
        set positionX(posX){ mirror.setAssociationNamespaceAttribute('posX', posX, guid, 'im-angular-demo'); },

        get positionY(){ return mirror.getAssociationNamespaceAttribute('posY', guid, 'im-angular-demo'); },
        set positionY(posY){ mirror.setAssociationNamespaceAttribute('posY', posY, guid, 'im-angular-demo'); },
        
        get zoomedIn(){ return mirror.getAssociationNamespaceAttribute('z', guid, 'im-angular-demo'); },
        set zoomedIn(z){ mirror.setAssociationNamespaceAttribute('z', z, guid, 'im-angular-demo'); },
        
        get type(){ return mirror.getAssociationNamespaceAttribute('t', guid, 'im-angular-demo'); },
        set type(t){ mirror.setAssociationNamespaceAttribute('t', t, guid, 'im-angular-demo'); },
        
        // These functions are all dealing with the private variable tags. This gives us a way to add,
        // delete, and list tags with an attribute. Internally these are represented as JSON and then these
        // methods are given to the associations to allow for easy manipulation as a directive.
        addTag: function(tag) {
          tags[tag] = true;
          saveTags();
        },

        deleteTag: function(tag) {
          delete tags[tag];
          saveTags();
        },

        listTags: function() {
          return Object.keys(tags);
        }
      };
    }

    // This function is extremely important to call after any major
    // change to the mirror variable. If the mirror switches to a new
    // mirror or a previous mirror, this must be called or Angular
    // won't be able to load any of the associations. This also needs
    // to be called during any type of sync operation when
    // associations can be created or deleted in bulk
    function updateAssociations() {
      console.log('updating associations');
      associations = mirror.listAssociations().map(function(guid) {
        return assocWrapper(guid);
      });
    }
    
    function updateAssociationsWithMirror(keyValue) {
      var curMirror = mirrorsAndAssocs[keyValue][0];
      var newAssociations = getNextAssociations(curMirror);
      mirrorsAndAssocs[keyValue][1] = newAssociations;
    }

    // Used to construct the very first ItemMirror object in the root
    // of the dropbox. In the future, this should be extended to use
    // FolderSelect, so that we can instead choose a different 'root'
    // itemMirror, or use a different set of drivers
    function constructRootMirror(dropboxClient) {
      var dropboxXooMLUtility;
      var dropboxItemUtility;
      var mirrorSyncUtility;
      var rootGroupingItemURI = '/';

      dropboxXooMLUtility = {
        fragmentURI: '/XooML2.xml',
        driverURI: 'DropboxXooMLUtility',
        dropboxClient: dropboxClient
      };
      dropboxItemUtility = {
        driverURI: 'DropboxItemUtility',
        dropboxClient: dropboxClient
      };
      mirrorSyncUtility = {
        utilityURI: 'MirrorSyncUtility'
      };

      var options = {
        groupingItemURI: rootGroupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility
      };

      return construct(options);
    }

    function construct(options) {
      var deferred = $q.defer();

      new ItemMirror(options, function(error, IM) {
        if (error) { deferred.reject(error); }
        else { deferred.resolve(IM); }
      });

      return deferred.promise;
    }

    // Creates a new itemMirror, and then sets the current mirror to
    // the newly created mirror. Additionally updates the
    // associations array to reflect the associations found in the
    // new mirror.
    //
    // Note that this doesn't check if a mirror has
    // already been created, that should be done before calling this
    // function to keep things efficient.
    function createChild(guid) {
      var deferred = $q.defer();

      console.log(mirror);
      mirror.createItemMirrorForAssociatedGroupingItem(guid, function(error, newMirror) {
        console.log(error);
        if (error) { deferred.reject(error); }
        else {
          mirrors.push(newMirror);
          mirror = newMirror;
          updateAssociations();
          console.log('assocs updated');
          console.log(associations);
          deferred.resolve();
        }
      });

      return deferred.promise;
    }

    //Added by Jane



    //change from updateAssociations
    function getNextAssociations(newMirror){
      console.log('getting associations');
      var nextAssociations;
      nextAssociations = newMirror.listAssociations().map(function(guid) {
        return assocWrapperWithMirror(guid, newMirror);
      });
      return nextAssociations;
    }

    //Pass a mirror for assicWrapper, so that the return value is mirror specific
    function assocWrapperWithMirror(guid, myMirror) {

      var result = myMirror.getAssociationNamespaceAttribute('tags', guid, 'im-angular-demo');
      var tags = result ? JSON.parse(result) : {};
      function saveTags() {
        myMirror.setAssociationNamespaceAttribute('tags', JSON.stringify(tags), guid, 'im-angular-demo');
      }

      return {
        guid: guid,
        get displayText(){ return myMirror.getAssociationDisplayText(guid); },
        set displayText(txt){ myMirror.setAssociationDisplayText(guid, txt); },
        localItem: myMirror.getAssociationLocalItem(guid),
        associatedItem: myMirror.getAssociationAssociatedItem(guid),
        isGrouping: myMirror.isAssociationAssociatedItemGrouping(guid),
        isPhantom: myMirror.isAssociationPhantom(guid),

        // Simple plain text attribute that stores a color for a given association
        get customColor(){ return myMirror.getAssociationNamespaceAttribute('color', guid, 'im-angular-demo'); },
        set customColor(color){ myMirror.setAssociationNamespaceAttribute('color', color, guid, 'im-angular-demo'); },
        
        get borderColor(){ return myMirror.getAssociationNamespaceAttribute('bcolor', guid, 'im-angular-demo'); },
        set borderColor(bcolor){ myMirror.setAssociationNamespaceAttribute('bcolor', bcolor, guid, 'im-angular-demo'); },

        //The position namgespace 
        get positionX(){ return myMirror.getAssociationNamespaceAttribute('posX', guid, 'im-angular-demo'); },
        set positionX(posX){ myMirror.setAssociationNamespaceAttribute('posX', posX, guid, 'im-angular-demo'); },

        get positionY(){ return myMirror.getAssociationNamespaceAttribute('posY', guid, 'im-angular-demo'); },
        set positionY(posY){ myMirror.setAssociationNamespaceAttribute('posY', posY, guid, 'im-angular-demo'); },
        
        //The namespace reocrds whether the label is zoomed in or not.
        get zoomedIn(){ return myMirror.getAssociationNamespaceAttribute('z', guid, 'im-angular-demo'); },
        set zoomedIn(z){ myMirror.setAssociationNamespaceAttribute('z', z, guid, 'im-angular-demo'); },
        
        //The type namespace differentiat the note phantom and the category phantom.
        get type(){ return myMirror.getAssociationNamespaceAttribute('t', guid, 'im-angular-demo'); },
        set type(t){ myMirror.setAssociationNamespaceAttribute('t', t, guid, 'im-angular-demo'); },
        
        
        
        // These functions are all dealing with the private variable tags. This gives us a way to add,
        // delete, and list tags with an attribute. Internally these are represented as JSON and then these
        // methods are given to the associations to allow for easy manipulation as a directive.
        addTag: function(tag) {
          tags[tag] = true;
          saveTags();
        },

        deleteTag: function(tag) {
          delete tags[tag];
          saveTags();
        },

        listTags: function() {
          return Object.keys(tags);
        }
      };
    }

    //create new mirror and new associations, stored in mirrorsAndAssocs
    //does not update the variable mirror and associations
    //the new mirror is for association of the currentMirror
    function createChildWithoutUpdate(currentMirror, guid) {
      var deferred = $q.defer();
      currentMirror.createItemMirrorForAssociatedGroupingItem(guid, function(error, newMirror) {
        if (error) {
          console.log(error);
          deferred.reject(error);
        }
        else {
          var newAssociations = getNextAssociations(newMirror);
          var mirrorAndAssoc = [newMirror];
          mirrorAndAssoc.push(newAssociations);
          mirrorsAndAssocs[guid] = mirrorAndAssoc;
          isCurMirrorReady[guid] = true;
          deferred.resolve();
        }
      });

      return deferred.promise;
    }

    //--Added by Jane



    return {
      save: function() {
        var deferred = $q.defer();
        mirror.save(function(error) {
          if (error) { deferred.reject(error); }
          else {
            updateAssociations();
            deferred.resolve();
          }
        });
        return deferred.promise;
      },

      refresh: function() {
        var deferred = $q.defer();

        mirror.refresh(function(error) {
          if (error) { deferred.reject(error); }
          else {
            updateAssociations();
            deferred.resolve();
          }
        });

        return deferred.promise;
      },

      createAssociation: function(options) {
        var deferred = $q.defer();

        mirror.createAssociation(options, function(error, guid) {
          if (error) {
            deferred.reject(error);
            console.log(error);
          }
          else {
            // Add a new wrapped association
            var newAssoc=assocWrapper(guid);
            newAssoc.customColor = "#efb218";
            newAssoc.borderColor = "#efb218";
            associations.push(  newAssoc );
            deferred.resolve(guid);
          }
        });

        return deferred.promise;
      },
      
      saveWithMirror: function(keyValue) {
        var deferred = $q.defer();
        var curMirror = mirrorsAndAssocs[keyValue][0];
        curMirror.save(function(error) {
          if (error) { deferred.reject(error); }
          else {
            updateAssociationsWithMirror(keyValue);
            deferred.resolve();
          }
        });

        return deferred.promise;
      },
      
      deleteAssocWithMirror: function(keyValue, guid) {
        var deferred = $q.defer();
        var curMirror = mirrorsAndAssocs[keyValue][0];
        var curAssociations = mirrorsAndAssocs[keyValue][1];
        
        curMirror.deleteAssociation(guid, function(error) {
          if (error) {
            deferred.reject(error);
            console.log("assoc delete error: " + error);
          }
          else {
            var guids = curAssociations.map(function(assoc) { return assoc.guid; });
            var delIdx = guids.indexOf(guid);
            // Removes the deleted association wrapper
            curAssociations.splice(delIdx, 1);
            curMirror.save(function(error) {
              if (error) { deferred.reject(error); }
              else {
                updateAssociationsWithMirror(keyValue);
                deferred.resolve();
              }
            });
          }
        });

        return deferred.promise;
      },
      //Edited by Jane
      
      
      //Edited by Sissi
      createSubPhantom : function(keyword,t,px,py, options){
      var deferred = $q.defer();
      console.log(keyword);
      var currentMirror =  mirrorsAndAssocs[ keyword ][0];
      var currentAssociations = mirrorsAndAssocs[keyword ][1];
      currentMirror.createAssociation(options, function(error, guid) {
          if (error) {
            deferred.reject(error);
            console.log(error);
          }
          else {
            var newAssoc =  assocWrapperWithMirror(guid,currentMirror);
            newAssoc.positionX = px;
            newAssoc.positionY = py;
            newAssoc.type = t;
            // Add a new wrapped association
            currentAssociations.push( newAssoc );
            deferred.resolve();
          }
        });

        return deferred.promise;
          
      },
      
      createLabel : function(keyword,t,px, py, options){
      var deferred = $q.defer();
      var currentMirror =  mirrorsAndAssocs[ keyword ][0];
      var currentAssociations = mirrorsAndAssocs[keyword ][1];
      currentMirror.createAssociation(options, function(error, guid) {
          if (error) {
            deferred.reject(error);
            console.log(error);
          }
          else {
            var newAssoc =  assocWrapperWithMirror(guid,currentMirror);
            
            newAssoc.positionX = px;
            newAssoc.positionY = py;
            newAssoc.type = t;
            newAssoc.customColor = "white";
            newAssoc.borderColor = "#4b3181";
            newAssoc.zoomedIn = true;
            // Add a new wrapped association
            currentAssociations.push( newAssoc );
            deferred.resolve();
          }
        });

        return deferred.promise;
          
      },


      deleteAssociation: function(guid) {

        var deferred = $q.defer();

        mirror.deleteAssociation(guid, function(error) {
          if (error) {
            deferred.reject(error);
            console.log(error);
          }
          else {
            var guids = associations.map(function(assoc) { return assoc.guid; });
            var delIdx = guids.indexOf(guid);
            // Removes the deleted association wrapper
            associations.splice(delIdx, 1);
            updateAssociations();
            deferred.resolve();
          }
        });

        return deferred.promise;
      },
      //Edited by Sissi
      
      


      // This function will attempt to navigate to the specified
      // associated item's mirror. It first will see the URI exists
      // for any of the current mirrors in memory, and if so switch to
      // that mirror. If no mirrors are found, it then will attempt to
      // create a new mirror using the associated item of the
      // association
      //
      // Note that you should only call this on associations which are
      // grouping items, otherwise a mirror cannot be constructed.
      navigateMirror: function(guid) {
        var deferred = $q.defer();

        var mirrorURIs = mirrors.map(function(mirror) { return mirror.getURIforItemDescribed(); });
        var associatedItem = mirror.getAssociationAssociatedItem(guid);
        var exists = mirrorURIs.some(function(uri) { return uri === associatedItem; });
        if (exists) {
          mirror = mirrors[ mirrorURIs.indexOf(associatedItem) ];
          updateAssociations();
          deferred.resolve();
        } else {
          createChild(guid).
            then(function() {
              deferred.resolve();
            }, function(error) {
              deferred.reject(error);
            });
        }
        return deferred.promise;
      },

      // Renames the local item of an association. This will actually
      // change the name on the storage platform, and so it's
      // asychronous.
      renameAssociation: function(guid, name) {
        var deferred = $q.defer();

        // The guid should NOT change, but we need to pass it in. The
        // itemMirror method should be updated
        mirror.renameAssociationLocalItem(guid,name, function(error, newGuid) {
          if (error) { deferred.reject(error); }
          else {
            var guids = associations.map(function(guid) { return guid; });
            // Sine a rename actually performs a sync / save /
            // refresh, this may not actually work the way it's
            // intended
            associations[ guids.indexOf(guids) ].localItem = name;
            deferred.resolve();
          }
        });

        return deferred.promise;
      },
      
      
     

      // Returns the association wrappers for use within a
      // controller. Note that we use a getter, because the
      // associations aren't a property, they're part of a closure,
      // and so a function is needed for retrieval
      get associations() { return associations; },

      get displayName() { return mirror.getDisplayName(); },
      set displayName(name) { mirror.setDisplayName(name); },

      get itemDescribed() { return mirror.getURIforItemDescribed(); },

      // A promise that completes after dropbox has authenticated, and
      // the initial root itemMirror has been created. This should
      // only be called once, preferably in some sort of start up area
      initialize: dropboxAuth.connectDropbox().
        then(constructRootMirror).
        then(function(rootMirror) {
          mirror = rootMirror;
          mirrors = [rootMirror];

          updateAssociations();
          //added by Jane
          //to initialize associationsArr
          mirrorsAndAssocs = {};
          mirrorsAndAssocs['root'] = [mirror,associations];
          isCurMirrorReady = {};
          //--Added by Jane
        }),

      // Calls the getCreator method of the itemMirror and sets it to that mirror if it isn't null. It's basically a way to go back.
      previous: function() {
        var deferred = $q.defer();
        var parent = mirror.getCreator();
        if (parent) {
          mirror = parent;
          updateAssociations();
          deferred.resolve();
        }

        return deferred.promise;
      },

      //Added by Jane

        //create mirror for an association of current mirror
        //the association must be a grouping association
      createSubMirror: function(currentMirror, guidOfAssoc){
        var deferred = $q.defer();
        createChildWithoutUpdate(currentMirror, guidOfAssoc).then(function() {
            deferred.resolve();
            }, function(error) {
            deferred.reject(error);
            });
        return deferred.promise;
      },

      getMirrorsAndAssocs: function(){
        return mirrorsAndAssocs;
      },

      getIsCurrentMirrorReady: function() {
        return isCurMirrorReady;
      },
      //--Added by Jane

    };
  }]);
