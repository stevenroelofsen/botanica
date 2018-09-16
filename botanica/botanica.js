"use strict";

var thingsToLoad = ["botanica/ui_background.png",
                    "botanica/grass.png", 
                    "botanica/path.png", 
                    "botanica/plot.png", 
                    "botanica/rat.png",
                    "botanica/laser.png", 
                    "botanica/cheese.png",
                    "botanica/sunflower.png",
                    "botanica/corn.png",
                    "botanica/wheat.png",
                    "botanica/corn_ear.png",
                    "botanica/popcorn.png", 
                    "botanica/shovel.png",
                    "botanica/sunflower_seed.png",
                    "botanica/corn_seed.png",
                    "botanica/wheat_seed.png",
                    "botanica/tool_highlight.png",
                    "botanica/blood_drop.png"];

var g = hexi(512, 544, setup, thingsToLoad, load);

g.fps = 60;

console.log(g)

g.scaleToWindow();

g.start();

var plants_layer = undefined, plants = undefined;
var terrain = undefined;

var osc = 2;

var lo = [0, 32]

var lvl_ctxt = undefined;

var enmy_pth = [[0, 6, 1, 0],
                    [3, 6, 0, -1],
                    [3, 3, 1, 0],
                    [8, 3, 0, 1],
                    [8, 9, -1, 0],
                    [5, 9, 0, 1],
                    [5, 12, 1, 0],
                    [12, 12, 0, -1],
                    [12, 6, 1, 0],
                    [16, 6, 1, 0]];

var rodens = undefined;
var rodens_layer = undefined;

var cheese = undefined;

var message_layer = undefined;

var score = 0;
var game_over = false;

var money = 80;
var money_ui = undefined;

var seeds = [];
var shovel = undefined;

var tools = {"shovel": 3, "wheat": 4, "sunflower": 5, "corn": 6};
var tool_text = {"shovel": "A trusty shovel to remove weed and hit rodens.\n Free to use.",
                 "wheat": "A variety of wheat that turns air into gold. Costs 40G.",
                 "sunflower": "Those sunflowers use sunlight to produce a beam\n capable to melt steel. Costs 100G.",
                 "corn": "This maize plant emits microwaves to pop its corn like\n fragmentation grenades. Costs 200G."};
var tool_cursors = {};
var tool_selected = undefined;
var tool_highlight = undefined;
var tool_msg = undefined;
var cursor_layer = undefined;

// waves format: number of rats, interval between rats, time until next wave
var waves = [[1, 0, 800], 
             [2, 100, 1000], 
             [2, 40, 1000],
             [4, 100, 1000], 
             [6, 40, 1000],
             [8, 60, 1200],
             [16, 30, 1200],
             [32, 20, 1200]];
var wave_number = -1;

var roden_counter = 0;
var roden_chrono = 0;
var wave_chrono = 0;

function load() {
    var canvas = document.createElement('canvas');
    var img = new Image();
    console.log(img)
    
    img.src = "botanica/level.png";
    console.log(img.width)
    lvl_ctxt = canvas.getContext('2d');
    lvl_ctxt.drawImage(img, 0, 0);  
    

}

function setup() {
    
    var bg_layer = g.group();
    terrain = g.group();
    plants_layer = g.group();
    rodens_layer = g.group();
    var ui_layer = g.group();
    message_layer = g.group();
    cursor_layer = g.group();
    
    plants = [];
    rodens = [];
    
    console.log(g.TextureCache)
    
    for(var tex in g.TextureCache)
    {
        console.log(tex)
        g.TextureCache[tex].baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    }
    
    
    console.log(lvl_ctxt)
    
    var it, jt;
    for(it = 0; it < 16; it ++)
    {
        for(jt = 0; jt < 16; jt ++)
        {
            var tex = undefined;
            var lvl = lvl_ctxt.getImageData(it, jt, 1, 1).data;
            if(lvl[0] == 255 && lvl[1] == 0)
            {
                tex = g.TextureCache["botanica/path.png"];
            }
            else if(lvl[0] == 255 && lvl[1] == 255)
            {
                tex = g.TextureCache["botanica/plot.png"];
            }
            else
            {
                tex = g.TextureCache["botanica/grass.png"];
            }
            var cell = g.sprite(tex);
            cell.setPosition(it*16*osc + lo[0], jt*16*osc + lo[1])
            cell.scale.x = osc;
            cell.scale.y = osc;
            cell.zIndex = 0;
            
            terrain.addChild(cell);
        }        
    }
    
   
    
    cheese = g.sprite(g.TextureCache["botanica/cheese.png"]);
    cheese.setPosition((enmy_pth[enmy_pth.length-1][0]-1)*16*osc + lo[0],
                     enmy_pth[enmy_pth.length-1][1]*16*osc + lo[1])
    cheese.scale.x = osc;
    cheese.scale.y = osc;
    
    plants_layer.addChild(cheese)
    
    var ui_bg = g.sprite(g.TextureCache["botanica/ui_background.png"]);
    ui_bg.scale.x = osc;
    ui_bg.scale.y = osc;
    bg_layer.addChild(ui_bg);
    
    shovel = g.sprite(g.TextureCache["botanica/shovel.png"]);
    shovel.setPosition(tools["shovel"]*16*osc, 0)
    shovel.scale.x = osc;
    shovel.scale.y = osc;
    ui_layer.addChild(shovel);
    
    var seed = g.sprite(g.TextureCache["botanica/wheat_seed.png"]);
    seed.setPosition(tools["wheat"]*16*osc, 0)
    seed.scale.x = osc;
    seed.scale.y = osc;
    ui_layer.addChild(seed);
    seeds.push(seed);
    
    var seed = g.sprite(g.TextureCache["botanica/sunflower_seed.png"]);
    seed.setPosition(tools["sunflower"]*16*osc, 0)
    seed.scale.x = osc;
    seed.scale.y = osc;
    ui_layer.addChild(seed);
    seeds.push(seed);
    
    var seed = g.sprite(g.TextureCache["botanica/corn_seed.png"]);
    seed.setPosition(tools["corn"]*16*osc, 0)
    seed.scale.x = osc;
    seed.scale.y = osc;
    ui_layer.addChild(seed);
    seeds.push(seed);
    
    tool_cursors["shovel"] = g.sprite(g.TextureCache["botanica/shovel.png"]);
    tool_cursors["shovel"].visible = false;
    cursor_layer.addChild(tool_cursors["shovel"]);
    tool_cursors["wheat"] = g.sprite(g.TextureCache["botanica/wheat_seed.png"]);
    tool_cursors["wheat"].visible = false;
    cursor_layer.addChild(tool_cursors["wheat"]);
    tool_cursors["sunflower"] = g.sprite(g.TextureCache["botanica/sunflower_seed.png"]);
    tool_cursors["sunflower"].visible = false;
    cursor_layer.addChild(tool_cursors["sunflower"]);
    tool_cursors["corn"] = g.sprite(g.TextureCache["botanica/corn_seed.png"]);
    tool_cursors["corn"].visible = false;
    cursor_layer.addChild(tool_cursors["corn"]);
    
    tool_highlight = g.sprite(g.TextureCache["botanica/tool_highlight.png"]);
    tool_highlight.setPosition(tools["shovel"]*16*osc, 0)
    tool_highlight.scale.x = osc;
    tool_highlight.scale.y = osc;
    tool_highlight.visible = false;
    ui_layer.addChild(tool_highlight);
    
    money_ui = g.text(money.toString(), 
                    "24px Futura", 
                    "white", 20, 20);                   
    money_ui.setPosition(400, 4);
    message_layer.addChild(money_ui);
    
    tool_msg = g.text("", 
                    "18px Futura", 
                    "white", 20, 20); 
    tool_msg.setPosition(40, 36);
    tool_msg.visible = false;
    message_layer.addChild(tool_msg);
    

    g.pointer.tap = function () {
        var cell_click = [Math.round((g.pointer.x - lo[0] - 16*osc/2)/(16*osc)),
                     Math.round((g.pointer.y - lo[1] - 16*osc/2)/(16*osc))];
        if(g.pointer.x > lo[0] && g.pointer.y > lo[1])
        {
        
            if(is_plot(cell_click))
            {
                if(tool_selected !== "shovel")
                {
                    if(has_plant(cell_click))
                        return
                    switch (tool_selected)
                    {
                        case "wheat":
                            make_wheat(cell_click);
                            break;
                        case "sunflower":
                            make_sunflower(cell_click);
                            break;
                        case "corn":
                            make_corn(cell_click);
                            break;
                            
                    }
                }
                else
                {
                    if(tool_selected == "shovel")
                        remove_plant(cell_click);
                }
                
            }
            if(tool_selected == "shovel")
                hit_rat([g.pointer.x, g.pointer.y])
        }
        else if(cell_click[1] == -1)
        {
            for(var tool in tools)
            {
                if(tools[tool] == cell_click[0])
                    if(tool_selected == tool)
                    {
                        tool_cursors[tool_selected].visible = false;
                        tool_selected = undefined;
                        tool_highlight.visible = false;
                        tool_msg.visible = false;
                        
                    }
                    else
                    {
                        if(tool_selected !== undefined)
                            tool_cursors[tool_selected].visible = false;
                        tool_selected = tool;
                        tool_highlight.setPosition(tools[tool]*16*osc, 0)
                        tool_highlight.visible = true;
                        tool_msg.visible = true;
                        tool_msg.text = tool_text[tool];
                        tool_cursors[tool].visible = true;
                        tool_cursors[tool_selected].setPosition(g.pointer.x, g.pointer.y);
                    }
            }
        }
    };
    
    g.state = play;
}

function is_plot(pos) {
    var lvl = lvl_ctxt.getImageData(pos[0], pos[1], 1, 1).data;
    return lvl[0] == 255 && lvl[1] == 255;
};

function has_plant(pos) {

    var plot_empty = false;
    plants.forEach(function (plant) {
        if(Math.abs(plant.grid_pos[0] - pos[0]) < 0.1 &&
            Math.abs(plant.grid_pos[1] - pos[1]) < 0.1)
        {
            console.log("plant is here");
            plot_empty = true;
        }
    });
    return plot_empty
        
};

function remove_plant(pos) {
    var plant_to_remove;
    var index_to_remove;
    plants.forEach(function (plant, index) {
        if(Math.abs(plant.grid_pos[0] - pos[0]) < 0.1 &&
            Math.abs(plant.grid_pos[1] - pos[1]) < 0.1)
        {
            plant_to_remove = plant;
            index_to_remove = index;
        }
    }); 
    if(plant_to_remove !== undefined)
    {
        switch (plant_to_remove.plant_type)
        {
            case "sunflower":
                plant_to_remove.laser.visible = false;
                break;
            case "corn":
                plant_to_remove.corn_particles.stop();
                plant_to_remove.popcorn_particles.stop();
                break;
                
        } 
    }
    plants.splice(index_to_remove,1);
    plants_layer.removeChild(plant_to_remove);
} 

function puchase_plant(price) {
    if(money >= price)
    {
        money -= price;
        money_ui.text = money.toString();
        return true;
    }
    else
    {
        return false;
    }
}

function make_wheat(pos) {

    if(!puchase_plant(40))
        return

    var plant = g.sprite(g.TextureCache["botanica/wheat.png"]);
    plant.setPosition(pos[0]*16*osc + lo[0], pos[1]*16*osc + lo[1] - 6)
    plant.scale.x = osc;
    plant.scale.y = osc;
    plant.money_tick = 0;
    plant.fight = function (plant) {
        if(plant.money_tick > 250 && !game_over)
        {
            plant.money_tick = 0;
            money += 5;
            score += 1;
            money_ui.text = money.toString();
        }
        else
        {
            plant.money_tick++;
        }
    };
    plant.grid_pos = pos;
    plant.plant_type = "wheat";
    plants_layer.addChild(plant);
    plants.push(plant);
}  

function make_sunflower(pos) {

    if(!puchase_plant(100))
        return

    var plant = g.sprite(g.TextureCache["botanica/sunflower.png"]);
    plant.setPosition(pos[0]*16*osc + lo[0], pos[1]*16*osc + lo[1] -10)
    plant.scale.x = osc;
    plant.scale.y = osc;
    plant.laser = g.sprite(g.TextureCache["botanica/laser.png"]);
    plant.laser.setPosition(pos[0]*16*osc + lo[0] + 16, pos[1]*16*osc + lo[1] + 6 -10)
    plant.laser.rotation = 1;
    plant.laser.scale.x = 10;
    plant.fight = function (plant) {
        // find closest roden
        var c_rat = undefined;
        var c_d = 1000.0;
        rodens.forEach(function (rat) {
            var d = Math.sqrt((plant.x - rat.x)*(plant.x - rat.x) + 
                                (plant.y - 11 - rat.y)*(plant.y - 11 - rat.y))
            if(d < c_d)
            {
               c_d = d; 
               c_rat = rat;
            }
        });

        if(c_rat !== undefined)
        {
            var a = Math.atan2(plant.y - 11 - c_rat.y, plant.x  - c_rat.x)
            var d = Math.sqrt((plant.x - c_rat.x)*(plant.x - c_rat.x) + 
                                (plant.y - 11 - c_rat.y)*(plant.y - 11 - c_rat.y))
            if(d < 16*osc*4)
            {
                plant.laser.rotation = a + 3.1415;
                plant.laser.scale.x = (d)/5;
                c_rat.life -= 0.5;
                plant.laser.visible = true;
            }
            else
            {
                plant.laser.visible = false;
            }
        }
        else
        {
            plant.laser.visible = false;
        }
    };
    plant.grid_pos = pos;
    plant.plant_type = "sunflower";
    plants_layer.addChild(plant);
    plants.push(plant);
}  



function make_corn(pos) {
    if(!puchase_plant(200))
        return
    var plant = g.sprite(g.TextureCache["botanica/corn.png"]);
    plant.setPosition(pos[0]*16*osc + lo[0], pos[1]*16*osc + lo[1] -10)
    plant.scale.x = osc;
    plant.scale.y = osc;
    plants_layer.addChild(plant);
    plants.push(plant);
    plant.fight = function (plant) {
        var num_rats = 0;
        rodens.forEach(function (rat) {
            var d = Math.sqrt((plant.x - rat.x)*(plant.x - rat.x) + 
                                (plant.y - 11 - rat.y)*(plant.y - 11 - rat.y))
            if(d < 16*osc*2)
            {
                num_rats++;
                rat.life -= 0.2*3/(num_rats+3);
            }
        });
    };
    plant.corn_particles = g.particleEmitter(
          700,                                   //The interval
          () => {                         
              g.createParticles(                 //The function
              (pos[0]+0.5)*16*osc + lo[0],                       //x position
              pos[1]*16*osc + lo[1] -10,                       //y position
              () => g.sprite("botanica/corn_ear.png"),        //Particle sprite
              g.stage,                           
              1,                                 //Number of particles
              0.01,                                 //Gravity
              true,                              //Random spacing
              3.6, 6.4,                          //Min/max angle
              12, 18,                            //Min/max size
              0.6, 1.0,                              //Min/max speed
              0.0, 0.0,                       //Min/max scale speed
              0.008, 0.008,                       //Min/max alpha speed
              -0.1, 0.1,                          //Min/max rotation speed
            );
          }
         
        );
    plant.corn_particles.play();
    plant.popcorn_particles = g.particleEmitter(
          1000,                                   //The interval
          () => {                         
              g.createParticles(                 //The function
              (pos[0]+3*(Math.random()-0.5))*16*osc + lo[0],                      
              (pos[1]+3*(Math.random()-0.5))*16*osc + lo[1] -10,        
              () => g.sprite("botanica/popcorn.png"),        //Particle sprite
              g.stage,                           
              6,                                 //Number of particles
              0.01,                                 //Gravity
              true,                              //Random spacing
              0, 6.4,                          //Min/max angle
              12, 18,                            //Min/max size
              1.0, 3.0,                              //Min/max speed
              0.1, 0.1,                       //Min/max scale speed
              0.02, 0.02,                       //Min/max alpha speed
              -0.1, 0.1,                          //Min/max rotation speed
            );
          }
         
        );
    plant.popcorn_particles.play();
    plant.grid_pos = pos;
    plant.plant_type = "corn";
    plants_layer.addChild(plant);
    plants.push(plant);
} 

function make_rat(pos) {
    var rat = g.sprite(g.TextureCache["botanica/rat.png"]);
    rat.setPosition(enmy_pth[0][0]*16*osc + lo[0],
                     enmy_pth[0][1]*16*osc + lo[1])
    rat.scale.x = osc;
    rat.scale.y = osc;
    rat.vx = enmy_pth[0][2];
    rat.vy = enmy_pth[0][3];
    rat.pth_sg = 0;
    rat.life = 180;
    rat.value = 10;
    rodens.push(rat);
    rodens_layer.addChild(rat);
};

function hit_rat(pix_pos) {
    var hit_one = false;
    rodens.forEach(function (rat) {

        if(Math.abs(rat.x+16-pix_pos[0]) < 16 &&
            Math.abs(rat.y+16-pix_pos[1]) < 16)
        {
            rat.life -= 10;
            hit_one = true;
            g.createParticles(                 //The function
              pix_pos[0],                       //x position
              pix_pos[1],                       //y position
              () => g.sprite("botanica/blood_drop.png"),        //Particle sprite
              g.stage,                           
              3,                                 //Number of particles
              0.01,                                 //Gravity
              true,                              //Random spacing
              3.6, 6.4,                          //Min/max angle
              2, 4,                            //Min/max size
              0.6, 1.0,                              //Min/max speed
              0.0, 0.0,                       //Min/max scale speed
              0.008, 0.008,                       //Min/max alpha speed
              -0.1, 0.1,                          //Min/max rotation speed
            );
        }
    });
    return hit_one;
};

function play() {

    if(tool_selected !== undefined)
    {
        tool_cursors[tool_selected].setPosition(g.pointer.x-8, g.pointer.y-12);
    }
    
    
    if(wave_chrono > 0)
        wave_chrono--;
    else
    {
        if(wave_number+1 == waves.length)
        {
            if(rodens.length == 0 && !game_over)
            {
                game_over = true;
                var game_over_msg = g.text("You Won!", 
                                            "64px Futura", 
                                            "black", 20, 20);
                game_over_msg.x = 120;
                game_over_msg.y = g.canvas.height / 2 - 64;
                message_layer.addChild(game_over_msg);
                var score_msg = g.text("Your Score: "+score.toString(), 
                                            "32px Futura", 
                                            "black", 20, 20);
                score_msg.x = 120;
                score_msg.y = g.canvas.height / 2;
                message_layer.addChild(score_msg);
            }
        }
        else
        {
            console.log("new wave")
            wave_number++;
            wave_chrono = waves[wave_number][2]; 
            roden_chrono = 0; 
            roden_counter = waves[wave_number][0];
        }
    }
    
    if(roden_chrono <= 0 && roden_counter > 0)
    {
        make_rat()
        roden_chrono = waves[wave_number][1];
        roden_counter--;
    }
    else if(roden_chrono > 0)
    {
        roden_chrono--;
    }
    
    plants.forEach(function (plant) {

        plant.fight(plant)

    });
    
    var rodens_to_remove = [];
    
    rodens.forEach(function (rat, index) {
        if(rat.life < 0)
        {
            rat.visible = false;
            rodens_to_remove.push(index);
            if(!game_over)
                score += rat.value;
                money += 20;
                money_ui.text = money.toString();
        }
        else
        {
        
            g.move(rat)
            if(g.hitTestRectangle(rat, cheese) && !game_over)
            {
                game_over = true;
                var game_over_msg = g.text("Cheese is lost!", 
                                            "64px Futura", 
                                            "black", 20, 20);
                game_over_msg.x = 80;
                game_over_msg.y = g.canvas.height / 2 - 64;
                message_layer.addChild(game_over_msg);
                var score_msg = g.text("Your Score: "+score.toString(), 
                                            "32px Futura", 
                                            "black", 20, 20);
                score_msg.x = 120;
                score_msg.y = g.canvas.height / 2;
                message_layer.addChild(score_msg);
            }    
            if((16*osc*enmy_pth[rat.pth_sg+1][0] + lo[0] - rat.x)*
                enmy_pth[rat.pth_sg][2] < 0 ||
                (16*osc*enmy_pth[rat.pth_sg+1][1] + lo[1] - rat.y)*
                enmy_pth[rat.pth_sg][3] < 0  )
            {
                rat.pth_sg++;
                if(rat.pth_sg == enmy_pth.length-1)
                {
                    rat.visible = false;
                    rodens_to_remove.push(index);
                }
                else
                {
                    rat.vx = enmy_pth[rat.pth_sg][2];
                    rat.vy = enmy_pth[rat.pth_sg][3];
                }
            }
        }
    });
    
    for (var it = rodens_to_remove.length -1; it >= 0; it--)
    {
        var rat = rodens.splice(rodens_to_remove[it],1);
        rodens_layer.removeChild(rat);
    }


    

    

}

