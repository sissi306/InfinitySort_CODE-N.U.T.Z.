'use strict';

/**
 * @ngdoc function
 * @name itemMirrorAngularDemoApp.controller:ExplorerCtrl
 * @description
 * # ExplorerCtrl
 * Controller of the itemMirrorAngularDemoApp
 */



angular.module('itemMirrorAngularDemoApp').controller('ExplorerCtrl', function ($scope, itemMirror) {
    // starts everything up after dropbox loads
    var init = itemMirror.initialize;
    
    init.then(
    function () {
        $("#subcontainer").css({
            height: window.innerHeight
        });
        $(".notes").css({
            height: window.innerHeight * 0.78
        });
    }).then(function () {
        $scope.mirror = itemMirror;
        
        $scope.mainAssociations = itemMirror.associations;
        for (var i = 0; i < $scope.mainAssociations.length; i++) {
            $scope.mainAssociations[i].customColor = "#ecc563";
            $scope.mainAssociations[i].borderColor = "#8B8B80";
        }
        $scope.selectedAssoc = null;
        
        
        $scope.currentKeyword = null;
        $scope.associations = null;
        $scope.addDiagramName = null;
        $scope.diagramName = null;
        $scope.deleteConfirmInfo = false;
        $scope.deleteAssoc = null;
        $scope.cleanConfirmInfo = false;
        $scope.resetConfirmInfo = false;
        
        $scope.loading = {
        };
        
        
        
        
        //added by Jane
        
        
        //this object stores mirrors and its associations, key is the guid of assoc of the mirror
        //for root mirror and associations, key is "root"
        $scope.mirrorsAndAssocs = itemMirror.getMirrorsAndAssocs();
        
        //this object used to track whether the mirror of a grouping association is ready
        //key is the guid, value is true or false
        //does NOT contain the root mirror
        $scope.isCurMirrorReady = itemMirror.getIsCurrentMirrorReady();
        
        // Get sub mirror for a certain association of current mirror
        // parameter keyvalue is the key of the current mirror and associations in the mirrorsAndAssocs object
        // parameter currentAssoc is the association which need to create sub mirror for
        // will only be used for sub folders, so the keyvalue would be guid of current mirror
        function getSubMirror(keyvalue, currentAssoc) {
            var currentMirror = $scope.mirrorsAndAssocs[keyvalue][0];
            if (! currentAssoc.isGrouping) {
                return;
            } else {
                //the mirror has already exist
                if ($scope.mirrorsAndAssocs[currentAssoc.guid]) {
                    console.log('The mirror has already exist');
                    mirrorsScopeUpdate();
                    $scope.loading = {
                    };
                    return;
                } else {
                    console.log('Creating sub mirror');
                    itemMirror.createSubMirror(currentMirror, currentAssoc.guid).then(
                    function () {
                        mirrorsScopeUpdate();
                        $scope.loading = {
                        };
                    });
                }
            }
        }
        
        function mirrorsScopeUpdate0() {
            $scope.mirrorsAndAssocs = itemMirror.getMirrorsAndAssocs();
            $scope.isCurMirrorReady = itemMirror.getIsCurrentMirrorReady();
            $scope.mainAssociations = $scope.mirrorsAndAssocs[ 'root'][1];
        }
        
        function mirrorsScopeUpdate() {
            $scope.mirrorsAndAssocs = itemMirror.getMirrorsAndAssocs();
            $scope.isCurMirrorReady = itemMirror.getIsCurrentMirrorReady();
            $scope.mainAssociations = $scope.mirrorsAndAssocs[ 'root'][1];
            $scope.associations = $scope.mirrorsAndAssocs[$scope.currentKeyword][1];
        }
        //--added by Jane
        
        // This needs to be called after the service updates the associations.
        // Angular doesn't watch the scope of the service's associations, so any
        // updates don't get propogated to the front end.
        function assocScopeUpdate() {
            $scope.associations = itemMirror.associations;
            $scope.selectedAssoc = null;
        }
        
        
        //Edited by Sissi
        //triggle the confirm window of deleting function
        $scope.deleteConfirm = function (assoc) {
            $scope.deleteConfirmInfo = true;
            $scope.deleteAssoc = assoc;
        }
        
        //This function control the canceal button on the confirm windows
        $scope.confirmInfoReset = function(){
            $scope.ConfirmInfo = false;
            $scope.deleteAssoc = null;
            $scope.cleanConfirmInfo = false;
            $scope.resetConfirmInfo = false;
        }
        
        //Delete a diagram 
        $scope.deleteDiagram = function (guid) {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Deleting ...";
            itemMirror.deleteAssocWithMirror('root', guid).
            then(function () {
                $scope.currentKeyword = null;
                $scope.associations = null;
                mirrorsScopeUpdate0();
                
                $scope.selectedAssoc = null;
                $scope.deleteConfirmInfo = false;
                $scope.deleteAssoc = null;
                $scope.loading = {
                };
            });
        };
        
        
        //Delete the sticky notes or the categories
        $scope.deleteSubAssoc = function (assoc) {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Deleting ...";
            itemMirror.deleteAssocWithMirror($scope.currentKeyword, assoc.guid).
            then(function () {
                mirrorsScopeUpdate();
                $scope.selectedAssoc = null;
                $scope.deleteConfirmInfo = false;
                $scope.deleteAssoc = null;
                $scope.loading = {
                };
            });
        };
        
        
        //Clean all the notes in the note box on the side bar
        $scope.clean = function () {
            $scope.cleanConfirmInfo = false;
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Cleanning All Notes ...";
            var recurrLoop = function (i) {
                if (i < $scope.associations.length) {
                    var currentAssoc = $scope.associations[i];
                    console.log(i);
                    if (currentAssoc.positionX == 'unmoved' && currentAssoc.type == "note") {
                        
                        itemMirror.deleteAssocWithMirror($scope.currentKeyword, currentAssoc.guid).
                        then(function () {
                            
                            mirrorsScopeUpdate();
                            i--;
                        }).then(function () {
                            recurrLoop(i + 1);
                        });
                    } else {
                        recurrLoop(i + 1);
                    }
                } else {
                    $scope.loading = {
                    };
                }
            }
            recurrLoop(0);
        };
        
        //Reset all the notes to the note box on the side bar
        $scope.reset = function () {
            $scope.resetConfirmInfo = false;
            for (var i = 0; i < $scope.associations.length; i++) {
                var currentAssoc = $scope.associations[i];
                if (currentAssoc.type == "note") {
                    currentAssoc.positionX = "unmoved";
                    currentAssoc.positionY = "unmoved";
                }
            }
            
            itemMirror.saveWithMirror($scope.currentKeyword).then(function () {
                mirrorsScopeUpdate();
            });
        };
       
        //This function gets the associations in a diagram folder and the display it in the edting place.
        //This function set the color of the tabs.
        $scope.getCurrentAssociations = function (event, assoc) {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Loading ...";
            $(".diagram").css({
                borderTopColor: "#B8B894",
                borderLeftColor: "#B8B894",
                borderRigthColor: "#B8B894"
            });
            for (var i = 0; i < $scope.mainAssociations.length; i++) {
                $scope.mainAssociations[i].customColor = "#ecc563";
                $scope.mainAssociations[i].borderColor = "#8B8B80";
            }
            
            
            event.currentTarget.style.borderTopColor = "#8B8B80";
            event.currentTarget.style.borderLeftColor = "#8B8B80"
            event.currentTarget.style.borderRightColor = "#8B8B80"
            
            assoc.customColor = "#efb218";
            assoc.borderColor = "#efb218";
            $scope.currentKeyword = assoc.guid;
            getSubMirror('root', assoc);
            
            $.fn.editable.defaults.mode = 'popout';
            //modify buttons style
            $.fn.editableform.buttons =
            '<button type="submit" class="btn btn-success editable-submit btn-mini b"><i class="glyphicon glyphicon-ok"></i></button>' +
            '<button type="button" class="btn editable-cancel btn-mini b"><i class="glyphicon glyphicon-remove"></i></button>';
            
            //make username required
            $('.diagramTitle').editable('option', 'validate', function (v) {
                if (! v) return 'Required field!';
                itemMirror.renameAssociation(assoc.guid, v).
                then(function () {
                    itemMirror.save().then(assocScopeUpdate);
                });
            });
        };
         //Edited by Sissi
         
        $scope.navigate = function (guid) {
            itemMirror.navigateMirror(guid).
            then(assocScopeUpdate);
        };
        
        
        
        $scope.previous = function () {
            itemMirror.previous().
            then(assocScopeUpdate);
        };
        
        //Edited by Sissi
        $scope.save = function () {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Saving ...";
            itemMirror.saveWithMirror($scope.currentKeyword).then(function () {
                mirrorsScopeUpdate();
                $scope.loading = {
                };
            });
        };
        
        
        
        $scope.refresh = function () {
            
            itemMirror.saveWithMirror($scope.currentKeyword).then(function () {
                mirrorsScopeUpdate();
            });
        };
        
        //This function changes the color of the category labels and notes.
        //This function supports the group editing of the color.
        $scope.changeColor = function (order, assoc) {
            var color1 = assoc.customColor;
            var color2 = assoc.borderColor;
            console.log(order);
            switch (order) {
                case 1:
                assoc.customColor = "#F9C5BB";
                assoc.borderColor = "#FF83AC";
                break;
                case 2:
                assoc.customColor = "#fed784";
                assoc.borderColor = "#FFAD5C";
                break;
                case 3:
                assoc.customColor = "#A7DCAE";
                assoc.borderColor = "#6CB591";
                break;
                case 4:
                assoc.customColor = "#BFA5F3";
                assoc.borderColor = "#C1A7D9";
                break;
                case 5:
                assoc.customColor = "#C0E4FE";
                assoc.borderColor = "#8AB8E6";
                break;

            }
            if(order == 6){
            if(assoc.type == "label"){
                assoc.customColor = "white";
                assoc.borderColor = "#4b3181";
                }
                if(assoc.type == "note"){
                assoc.customColor = "#FCF8E3";
                assoc.borderColor = "#FAEBCC";
                }
            }
            if (assoc.type == "label") {
                for (var i = 0; i < $scope.associations.length; i++) {
                    var currentAssoc = $scope.associations[i];
                    disX = currentAssoc.positionX - assoc.positionX;
                    disY = currentAssoc.positionY - assoc.positionY;
                    if ((currentAssoc.type == "note") &&(disX < 250) &&(disX > -50) &&(disY < 200) &&(disY > 0)) {
                    if(order != 6){
                        currentAssoc.customColor = assoc.customColor;
                        currentAssoc.borderColor = assoc.borderColor;
                        }
                        if(order == 6){
                            currentAssoc.customColor = "#FCF8E3";
                            currentAssoc.borderColor = "#FAEBCC";
                        }
                    }
                }
            }
            itemMirror.saveWithMirror($scope.currentKeyword).then(function () {
                mirrorsScopeUpdate();
            });
        };
        //Edited by Sissi
        
        
        // Only one association is ever selected at a time. It has the boolean
        // selected property, to allow for unique styling
        
        $scope.select = function (assoc) {
            
            if ($scope.selectedAssoc) {
                $scope.selectedAssoc.selected = false;
                $scope.selectedAssoc = null;
            }
            $scope.selectedAssoc = assoc;
            $scope.selectedAssoc.selected = true;
        };
        
        
        // Phantom Creation Section
        
        // This is used to intially set the values, and reset them after we create a phantom.
        // We don't want the same information stuck in those boxes after creating them
        function resetPhantomRequest() {
            $scope.phantomRequest.displayText = '';
            $scope.phantomRequest.itemURI = '';
            $scope.phantomRequest.localItemRequested = false;
        }
        
        $scope.phantomRequest = {
        };
        resetPhantomRequest();
        
        // Folder Creation Section, nearly the exact same as the phanbom request,
        // with a few minor differences
        function resetFolderRequest() {
            $scope.folderRequest.displayText = '';
            $scope.folderRequest.localItem = '';
            $scope.folderRequest.isGroupingItem = true;
        }
        
        $scope.folderRequest = {
        };
        resetFolderRequest();
        
        
        //Edited by Jane and Sissi
        //This function creates the diagram and change the color of this diagram tab.
        $scope.createDiagram = function (name) {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Creating ...";
            $(".diagram").css({
                borderTopColor: "#B8B894",
                borderLeftColor: "#B8B894",
                borderRigthColor: "#B8B894"
            });
            
            for (var i = 0; i < $scope.mainAssociations.length; i++) {
                $scope.mainAssociations[i].customColor = "#ecc563";
                $scope.mainAssociations[i].borderColor = "#8B8B80";
            }
            $scope.folderRequest.localItem = name;
            $scope.folderRequest.displayText = " ";
            var keyValue = 'root';
            itemMirror.createAssociation($scope.folderRequest).
            then(function (newGuid) {
                switchToAssocEditor();
                
                itemMirror.saveWithMirror(keyValue).
                then(function () {
                    $scope.currentKeyword = newGuid;
                    console.log("new Assoc guid:" + newGuid);
                    //construct mirror for the new Assoc
                    var currentMirror = $scope.mirrorsAndAssocs[keyValue][0];
                    itemMirror.createSubMirror(currentMirror, newGuid).
                    then(function () {
                        mirrorsScopeUpdate();
                        itemMirror.save().then(assocScopeUpdate);
                        $scope.select(currentMirror);
                        $scope.addDiagramName = false;
                        $scope.diagramName = undefined;
                        $scope.loading = {
                        };
                    });
                });
                
                resetFolderRequest();
            }).then(function () {
                $(".diagram").last().css({
                    borderTopColor: "#8B8B80",
                    borderLeftColor: "#8B8B80",
                    borderRigthColor: "#8B8B80"
                });
            });
        };
        
        
        //Create notes and positions namespace of a new note are unmoved.
        $scope.createSubPhantom = function () {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Creating ...";
            $scope.phantomRequest.itemURI = " ";
            $scope.phantomRequest.displayText = "Enter your note here";
            var t = "note";
            var px = "unmoved";
            var py = "unmoved";
            itemMirror.createSubPhantom($scope.currentKeyword, t, px, py, $scope.phantomRequest).
            then(function () {
                switchToAssocEditor();
                itemMirror.saveWithMirror($scope.currentKeyword).then(function () {
                    mirrorsScopeUpdate();
                    $scope.loading = {
                    };
                });
                
                resetPhantomRequest();
            });
        };
        
        
        //Create category labels and positions namespace of a new note are unmoved.
        $scope.createLabel = function () {
            $scope.loading.isLoading = true;
            $scope.loading.loadInfo = "Creating ...";
            $scope.phantomRequest.itemURI = " ";
            $scope.phantomRequest.displayText = "Name your category";
            var t = "label";
            var px = "unmoved";
            var py = "unmoved";
            itemMirror.createLabel($scope.currentKeyword, t, px, py, $scope.phantomRequest).
            then(function () {
                switchToAssocEditor();
                itemMirror.saveWithMirror($scope.currentKeyword).then(function () {
                    mirrorsScopeUpdate();
                    $scope.loading = {
                    };
                });
                resetPhantomRequest();
            });
        };
         //Edited by Jane and Sissi
        
        
        
        
        
        // default section for our editing panel
        function switchToAssocEditor() {
            $scope.editSection = 'assoc-editor';
        }
        
        switchToAssocEditor();
        
        
        
        
        
        
        //Edited by Sissi
        //Grag and Drop
        var file = null;
        var fileAssoc = null;
        var fileZoomIn = null;
        var posX = 0, posY = 0;
        var distanceX =[];
        var distanceY =[];
        var postPosX =[];
        var postPosY =[];
        var indexOfNote =[];
        var indexOfChildNote =[];
        var disX = 0, disY = 0;
        var h;
        
        $scope.zoomIn = function (assoc) {
            var count = 0;
            fileZoomIn.style.width = "485px";
            fileZoomIn.style.overflow = "auto";
            assoc.zoomedIn = false;
            for (var i = 0; i < $scope.associations.length; i++) {
                var currentAssoc = $scope.associations[i];
                if (currentAssoc.type == 'note' && currentAssoc.positionX != "unmoved") {
                    disX = currentAssoc.positionX - assoc.positionX;
                    disY = currentAssoc.positionY - assoc.positionY;
                    if ((disX < 250) &&(disX > -50) &&(disY < 200) &&(disY > 0)) {
                        postPosX.push(disX);
                        postPosY.push(disY);
                        indexOfNote.push(i);
                        currentAssoc.positionX = assoc.positionX + 5 + count % 3 * 155;
                        currentAssoc.positionY = assoc.positionY + 45 + Math.floor(count / 3) * 155;
                        count++;
                    }
                }
            }
            console.log(indexOfNote.length);
            h = 45 + Math.ceil(indexOfNote.length / 3) * 155
            fileZoomIn.style.height = h + 'px';
            itemMirror.saveWithMirror($scope.currentKeyword);
        };
        
        $scope.zoomOut = function (assoc) {
            fileZoomIn.style.width = "200px";
            fileZoomIn.style.height = "50px";
            fileZoomIn.style.overflow = "";
            assoc.zoomedIn = true;
            var index = null;
            for (var i = 0; i < indexOfNote.length; i++) {
                index = indexOfNote[i];
                disX = $scope.associations[index].positionX - assoc.positionX;
                disY = $scope.associations[index].positionY - assoc.positionY;
                console.log(disX);
                console.log(disY);
                if ((disX < 485) &&(disX > 0) &&(disY < h) &&(disY > 0)) {
                    $scope.associations[index].positionX = assoc.positionX + postPosX[i];
                    $scope.associations[index].positionY = assoc.positionY + postPosY[i];
                }
            }
            indexOfNote =[];
            postPosX =[];
            postPosY =[];
            fileZoomIn = null;
            itemMirror.saveWithMirror($scope.currentKeyword);
        };
        
        function zoomOuts() {
            for (var i = 0; i < $scope.associations.length; i++) {
                $scope.associations[i].zoomedIn = true;
            }
        }
        
        
        //Grag and Drop
        
        function onMouseMove(event) {
            event.preventDefault();
        }
        
        //mouseup function in the whiteboard.
        //This function supports the group moving feature.
        $scope.onMouseUp = function (event) {
            if (file != null || fileAssoc != null) {
                
                var left = event.clientX + posX;
                var top = event.clientY + posY;
                
                file.style.left = left + 'px';
                file.style.top = top + 'px';
                if (file.style.position != "absolute") {
                    $(file).css({
                        position: 'absolute'
                    });
                }
                
                fileAssoc.positionX = left;
                fileAssoc.positionY = top;
                var x = null, y = null, z = null;
                if (fileAssoc.type == 'note') {
                    for (var i = 0; i < $scope.associations.length; i++) {
                        var currentAssoc = $scope.associations[i];
                        if (currentAssoc.type == "label") {
                            if (x == null && y == null) {
                                x = fileAssoc.positionX - currentAssoc.positionX;
                                y = fileAssoc.positionY - currentAssoc.positionY;
                                z = i;
                            }
                            if (x != null && y != null) {
                                if ((Math.abs(x) > Math.abs(fileAssoc.positionX - currentAssoc.positionX)) && (Math.abs(y) > Math.abs(fileAssoc.positionY - currentAssoc.positionY))) {
                                    x = fileAssoc.positionX - currentAssoc.positionX;
                                    y = fileAssoc.positionY - currentAssoc.positionY;
                                    z = i;
                                }
                            }
                        }
                    }
                }
                
                if ((x < 250) &&(x > -50) &&(y < 200) &&(y > 0)) {
                    var a = parseInt($scope.associations[z].positionX) + parseInt(x);
                    console.log(a);
                    
                    $(".labelBorder").css({
                        left: parseInt($scope.associations[z].positionX) -50 + 'px',
                        top: parseInt($scope.associations[z].positionY) + 20 + 'px'
                    });
                    $(".labelBorder").show(300).delay(800).hide(1000);
                }
                
                if (fileAssoc.type == 'label' && fileAssoc.positionX != 'unmoved') {
                    
                    var index = null;
                    for (var i = 0; i < indexOfChildNote.length; i++) {
                        index = indexOfChildNote[i];
                        $scope.associations[index].positionX = left + distanceX[i];
                        $scope.associations[index].positionY = top + distanceY[i];
                    }
                }
            }
            
            fileAssoc = null;
            file = null;
            posX = 0;
            posY = 0;
            distanceX =[];
            distanceY =[];
            indexOfChildNote =[];
            event.preventDefault();
            itemMirror.saveWithMirror($scope.currentKeyword);
        };
        
        //The mouseup function on the side bar.
        $scope.MouseUp = function (event) {
            
            
            if (fileAssoc && fileAssoc.type == 'note' && event.currentTarget.id == "notes") {
                fileAssoc.positionX = "unmoved";
                fileAssoc.positionY = "unmoved";
                fileAssoc.customColor = "";
                fileAssoc.borderColor = "";
            }
            if (fileAssoc && fileAssoc.type == 'label' && event.currentTarget.id == "labels") {
                fileAssoc.positionX = "unmoved";
                fileAssoc.positionY = "unmoved";
                fileAssoc.customColor = "white";
                fileAssoc.borderColor = "#4b3181";
            }
            fileAssoc = null;
            file = null;
            posX = 0;
            posY = 0;
            event.preventDefault();
            itemMirror.saveWithMirror($scope.currentKeyword);
        };
        
        //This function saves the start position of the associations.
        //This function starts the mousemove listener.
        //This function supports the content editing of the associations.
        $scope.onMouseDown = function (event, assoc) {
            var style = window.getComputedStyle(event.target, null);
            var container = document.getElementById("whiteBoard");
            file = event.currentTarget;
            fileZoomIn = event.currentTarget;
            fileAssoc = assoc;
            $scope.select(assoc);
            if (fileAssoc.type == 'label' && fileAssoc.positionX != "unmoved") {
                for (var i = 0; i < $scope.associations.length; i++) {
                    var currentAssoc = $scope.associations[i];
                    
                    if (currentAssoc.type == "note" && currentAssoc.positionX != "unmoved") {
                        disX = currentAssoc.positionX - assoc.positionX;
                        disY = currentAssoc.positionY - assoc.positionY;
                        if (assoc.zoomedIn) {
                            if ((disX < 250) &&(disX > -50) &&(disY < 200) &&(disY > 0)) {
                                distanceX.push(disX);
                                distanceY.push(disY);
                                indexOfChildNote.push(i);
                            }
                        } else {
                            if ((disX < 485) &&(disX > 0) &&(disY < 525) &&(disY > 0)) {
                                distanceX.push(disX);
                                distanceY.push(disY);
                                indexOfChildNote.push(i);
                            }
                        }
                    }
                }
            }
            if (file.getBoundingClientRect) {
                var rect = file.getBoundingClientRect ();
            }
            if (container.getBoundingClientRect) {
                var containerRect = container.getBoundingClientRect ();
            }
            posX = parseInt(rect.left - containerRect.left, 10) - event.clientX;
            posY = parseInt(rect.top - containerRect.top, 10) - event.clientY;
            
            $scope.$on('mousemove', onMouseMove(event));
            //Edit content of the sticky notes and groups
            $(document).ready(function () {
                
                
                $.fn.editable.defaults.mode = 'popout';
                //modify buttons style
                $.fn.editableform.buttons =
                '<button type="submit" class="btn btn-success editable-submit btn-mini b"><i class="glyphicon glyphicon-ok"></i></button>' +
                '<button type="button" class="btn editable-cancel btn-mini b"><i class="glyphicon glyphicon-remove"></i></button>';
                $('.stickyName').editable();
                
                //make username required
                $('.stickyName').editable('option', 'validate', function (v) {
                    if (! v) return 'Required field!';
                    assoc.displayText = v;
                    console.log(assoc.displayText);
                    itemMirror.saveWithMirror($scope.currentKeyword);
                });
                
                $('.sticky').editable();
                
                //make username required
                $('.sticky').editable('option', 'validate', function (v) {
                    if (! v) return 'Required field!';
                    assoc.displayText = v;
                    console.log(assoc.displayText);
                    itemMirror.saveWithMirror($scope.currentKeyword);
                });
                
                $('.groupName').editable();
                
                //make username required
                $('.groupName').editable('option', 'validate', function (v) {
                    if (! v) return 'Required field!';
                    assoc.displayText = v;
                    console.log(assoc.displayText);
                    itemMirror.saveWithMirror($scope.currentKeyword);
                });
            });
        };
        //Edited by Sissi
    });
});