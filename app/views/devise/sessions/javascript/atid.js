
/* ~. GLOBALS .~ */

// canvas: html canvas reference
var canvas = document.querySelector("#drawScreen > canvas");
    canvas.width = window.innerWidth * 0.88;
    canvas.height = 500;

if(canvas.getContext)
    var canvasCtx = canvas.getContext('2d');

// mouse: window mouse position reference
var mouse = {};

// graph: used while drawing a graph into the canvas. stores temporary the image file 
var graph;
 
// currentTool: used when user picks up a tool for drawing in the canvas 
var currentTool;

// network: array storing nodes drawned in canvas
var network = [];

// arcMap: array of arcs already drawed
var arcMap = [];

/*
 *   arc:
 *   used when user is drawing a new arc between two tools.
 *   dinamically updated when user select origin and destiny for the arc
 */
var arc = {
    'enable': false,
    'layers': {
        'origin': '',
        'destiny': ''
    },
};

/* 
*  pickTool
*  TRIGERRED WHEN USER SELECTS A TOOL IN THE TOOLBAR
*/
var pickTool = function () {
    currentTool = document.querySelector("[name=tool]:checked").value;
    
    $(".currentTool").removeClass("currentTool") 
    
    $("[name=tool]:checked").parent().addClass("currentTool");
    // GET VALUE FROM TOOL SELECTED BY USER
    var toolImg = document.querySelector("[name=tool]:checked + img");

    // CREATE NEW IMAGE ELEMENT FROM TOOL SELECTED
    graph = new Image();
    graph.width = 32;
    graph.height = 32;
    graph.src = toolImg.src;
    
    // set mouse cursor
    setCursorClass(toolImg.src);

    if(currentTool == "arc")
        configArc();
}; 

/* 
*  setCursorClass
*  DEFINES CUSTOM CURSOR BASED ON CURRENT TOOL SELECTED
*/
var setCursorClass = function(tool) {
    canvas.style.cursor = "url('" + tool + "'), auto";
};

/* 
*  getMousePos
*  Map mouse position in order to place drawing correctly
*/
var getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
        y: (evt.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height
    };
};

var getNetworkLength = function (nodetype) {
    var n_layers = 0;
    for(var i = 0; i < network.length; i++) {
        if(network[i].layer.data.element == nodetype)
            ++n_layers;
    }
    return n_layers;
};

/* 
*  drawImage
*  Draw image on canvas
*/
var drawImage = function (source, posX, posY, width, height) {
    $(canvas).addLayer({
      name: currentTool + getNetworkLength(currentTool),
      type: 'image',
      source: source,
      x: posX, y: posY,
      width: width, height: height,
      draggable: true,
      data : {
        element: currentTool,
        arc: {
            input: [],
            output: [],
        }
      },
      click: function(layer) {
               if(currentTool == "arc" && arc.enable) {
            
                    if(!arc.layers.origin) {
                        arc.layers.origin = layer;
                        arcMap.push({
                            name: layer.name,
                            element: layer.data.element,
                            x: layer.x,
                            y: layer.y,
                        });

                    }
                    else {
                        // TROCAR ESSA RUMA DE ELSE IF POR SWITCH (VAMU FAZER DIREITO U.U)
                        if(arc.layers.origin.data.element === layer.data.element) {
                            alert("you can't create an arc between same tools");
                            arc.layers.origin = '';
                            arc.layers.destiny = '';
                            return;
                        }
                        else if (arc.layers.origin.data.element == "repository" && layer.data.element != "activity") {
                            alert("repositories can only be linked with activities");
                            arc.layers.origin = '';
                            arc.layers.destiny = '';
                            return;
                        }
                        else if (arc.layers.origin.data.element == "event" && layer.data.element != "transition") {
                            alert("events can only be linked to transitions");
                            arc.layers.origin = '';
                            arc.layers.destiny = '';
                        }
                        else if (arc.layers.origin.data.element == "transition" && (layer.data.element != "activity" && layer.data.element != "composition")) {
                            alert("transitions can only be linked to activities or composite activities");
                            arc.layers.origin = '';
                            arc.layers.destiny = '';
                        }
                        else if(arc.layers.origin.data.element == "activity" && (layer.data.element != "transition" && layer.data.element != "repository")) {
                            alert("activities can only be linked to transitions or repositories");
                            arc.layers.origin = '';
                            arc.layers.destiny = '';
                        }
                        else if(arc.layers.origin.data.element == "composition" && layer.data.element != "transition") {
                            alert("composite activities can only be linked to transition");
                            arc.layers.origin = '';
                            arc.layers.destiny = '';
                        }
                        else {
                            arc.layers.destiny = layer;
                            arcMap.push({
                                name: layer.name,
                                element: layer.data.element,
                                x: layer.x,
                                y: layer.y
                            });
                            drawArc(arc);    
                        }        
                    }
               }
      },
    
      dblclick : function (layer) {
          if (layer.data.element == "composition" && currentTool == "cursor") {
              $(canvas).parent().hide();
              canvas = document.querySelector("#" + layer.name + " > canvas");
              $("#" + layer.name).show();
          }
      },
    })
    .drawLayers();
    
    if(!(currentTool === "transition")) {
        promptDescription(currentTool);
    }
    
    if(currentTool === "composition") {
       newSubnet(currentTool + (getNetworkLength(currentTool)));
    }
    network.push({
        'id': network.length,
        'node': currentTool,
        'posX': mouse.x,
        'posY': mouse.y,
        'layer': $(canvas).getLayer(currentTool + (getNetworkLength(currentTool))),
        'label': ''
    });
    console.log("Node inserted to network.");
};

var promptDescription = function ( tool ) {
    document.getElementById("descriptionTitle").innerHTML = tool;
    var descriptionDiv = document.getElementById("descriptionInput");
    descriptionDiv.style.left = mouse.x + 40 + "px";
    descriptionDiv.style.top = mouse.y + 40 + "px";        
    descriptionDiv.hidden = false;
}

var submitDescription = function () {
    var nodeDescription = document.getElementById("nodeTitle").value;
    var descriptionDiv = document.getElementById("descriptionInput");
    if(nodeDescription != "") {
        // precisa ter o dado de qual nó está sendo gravado o nome
    }
    $(canvas).drawText({
      layer: true,
      fillStyle: '#000',      
      x: descriptionDiv.style.left.substr(0, descriptionDiv.style.left.length - 2), y: descriptionDiv.style.top.substr(0, descriptionDiv.style.top.length - 2),
      fontSize: 11,
      fontFamily: 'Arial, sans-serif',
      text: nodeDescription,  
    });
    $("#nodeTitle").val("");
    document.getElementById("descriptionInput").hidden = true;
}

var configArc = function (layer) {
    arc.enable = true;
};

var drawArc = function (arc) {
    $(canvas).drawLine({
        layer: true, 
        name: 'arc' + (Math.floor(arcMap.length / 2) + 1), 
        strokeStyle: '#000',
        strokeWidth: 1,
        rounded: true,
        draggable: false,
        startArrow: false,
        endArrow: true,
        arrowRadius: 15,
        arrowAngle: 90,
        x1: arc.layers.origin.x, y1: arc.layers.origin.y,
        x2: arc.layers.destiny.x, y2: arc.layers.destiny.y,
    });
    
    attribArcToLayers(arc, "arc" + (Math.floor(arcMap.length/2) + 1));
    updateArcOnDragLayers(arc);
    arc.layers.origin = '';
    arc.layers.destiny = '';
};

var attribArcToLayers = function (arc, arcName) {
    $(canvas).getLayer(arc.layers.origin.name).data.arc["output"].push($(canvas).getLayer(arcName));
    $(canvas).getLayer(arc.layers.destiny.name).data.arc["input"].push($(canvas).getLayer(arcName)); 
};

var updateArcOnDragLayers = function (arc) {
    $.each(arc.layers, function (key, value) {
        value.drag = function (layer) {
            
            for(var i = 0; i < layer.data.arc.input.length; i++) {
                if(layer.data.arc.input[i] != '') {
                    var input = $(canvas).getLayer(layer.data.arc.input[i].name);
                    input.x2 = layer.x;
                    input.y2 = layer.y;
                }
            }
            
            for(var j = 0; j < layer.data.arc.output.length; j++) {
                if(layer.data.arc.output[j] != '') {
                    var output = $(canvas).getLayer(layer.data.arc.output[j].name);
                    output.x1 = layer.x;
                    output.y1 = layer.y;
                }
            }
        };
    });
};

$("input[name=tool]").each(function (index, value) {
    $(value).on("change", pickTool);
});

/*
 *  NewSubnet:
 *  creates a new canvas for subnet
 *  @param name:
 *  reference to the subnet associated
 */
var newSubnet = function (name) {
    
    $("<div></div>", {
      "id": name,
      "class": "subnet-info",
    }).appendTo( "#drawingArea" ).hide();
    
    $("<button><i class='fa fa-arrow-left'></i> exit subnet</button>", {
      "class" : "subnet-exit"
    }).appendTo("#" + name).on({
        click: function(){
        $("#" + name).hide();
        canvas = document.querySelector("#drawScreen > canvas");
        $("#drawScreen").show();  
      }});
    
    $("#drawScreen > canvas")
           .clone()
           .clearCanvas()
           .appendTo("#" + name)
           .on({
                "mousemove": function (evt) {
                    mouse = getMousePos(canvas, evt);
                },
                "click": function(evt) { interactCanvas(evt); }
            });
};

$(canvas).on({
    "mousemove": function (evt) {
        mouse = getMousePos(canvas, evt);
    },
    "click": function(evt) { interactCanvas(evt); }
});         

var interactCanvas = function (event) {
    if(currentTool == "cursor" || currentTool == "arc") {
        // default behavior
    }
    else {
        if(!($(canvas).hasClass("forbidden")))
            drawImage(graph.src, mouse.x + graph.width/2, mouse.y + graph.height/2, graph.width, graph.height);        
    }
}

var saveNetwork = function () {
    var output = [];
    for(var obj in network) {
        var one = JSON.stringify(obj, function(key, val) {
                    if (val != null && typeof val == "object") {
                            return "object";
                        }
                        return val;
                    });
        output.push(one);
        // output.push(JSON.stringify(network[obj]));
    }
        
    document.write(output);
};