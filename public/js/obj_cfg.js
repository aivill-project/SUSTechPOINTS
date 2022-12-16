// size is the dimension of the object in x/y/z axis, with unit meter.

class ObjectCategory
{


    obj_type_map = {
        Small_Car:            {color: '#ffff32',  size:[4.0, 2.0, 1.7], attr:["Door_Open", "Parked", "Accident", "Trunk_Open"]}, 
        Light_Car:     {color: '#f0f064',  size:[10.0, 2.5, 2.0], attr:["Door_Open", "Parked", "Accident", "Trunk_Open"]},
        Car:            {color: '#f08096',  size:[11.0, 3.0, 2.5], attr:["Door_Open", "Parked", "Accident", "Trunk_Open"]},
        Van:          {color: '#80f0c8',  size:[12.0, 4.0, 3.5], attr:["Door_Open", "Parked", "Accident", "Trunk_Open"]},
        SUV: {color: '#3366ff',  size:[1.6, 0.6, 1.2], attr:["Door_Open", "Parked", "Accident", "Trunk_Open"]},
        Small_Truck:        {color: '#800032',  size:[1.4, 0.5, 1.5], attr:["Door_Open", "Parked", "Accident", "Cargo_Loading"]},
        Medium_Truck:     {color: '#800064',  size:[0.5, 0.8, 1.8], attr:["Door_Open", "Parked", "Accident", "Cargo_Loading"]},
        Large_Truck:     {color: '#800096',  size:[0.5, 0.8, 1.8], attr:["Door_Open", "Parked", "Accident", "Cargo_Loading"]},
        Mini_Bus:     {color: '#808080',  size:[0.5, 0.8, 1.8], attr:["Door_Open", "Parked", "Accident", "Riding_Passenger"]},
        Bus:     {color: '#8080ff',  size:[0.5, 0.8, 1.8], attr:["Door_Open", "Parked", "Accident", "Riding_Passenger"]},
        Special_Vehicle:     {color: '#f0f0f0',  size:[0.5, 0.8, 1.8], attr:["Door_Open", "Parked", "Accident"]},
        Two_Wheeler:     {color: '#ff8080',  size:[0.5, 0.8, 1.8], attr:["Parked", "Accident", "Rider_Off"]},
        Kickboard:     {color: '#ff80ff',  size:[0.5, 0.8, 1.8], attr:["Parked", "Accident", "Rider_Off"]},
        Adult:     {color: '#ffff00',  size:[0.5, 0.8, 1.8], attr:["Accident", "Sit", "Wheelchair", "Crowd"]},
        Kid:     {color: '#ffff80',  size:[0.5, 0.8, 1.8], attr:["Accident", "Sit", "Wheelchair", "Crowd"]},
        Unknown:     {color: '#0f0f0f',  size:[0.1, 0.1, 0.1]}
    };


    constructor(){
        
    }

    popularCategoris = ["Small_Car","Light_Car","Car","Van","SUV","Small_Truck","Medium_Truck","Large_Truck","Mini_Bus","Bus","Special_Vehicle","Two_Wheeler","Kickboard","Adult","Kid"];

    guess_obj_type_by_dimension(scale){

        var max_score = 0;
        var max_name = 0;
        this.popularCategoris.forEach(i=>{
            var o = this.obj_type_map[i];
            var scorex = o.size[0]/scale.x;
            var scorey = o.size[1]/scale.y;
            var scorez = o.size[2]/scale.z;

            if (scorex>1) scorex = 1/scorex;
            if (scorey>1) scorey = 1/scorey;
            if (scorez>1) scorez = 1/scorez;

            if (scorex + scorey + scorez > max_score){
                max_score = scorex + scorey + scorez;
                max_name = i;
            }
        });

        console.log("guess type", max_name);
        return max_name;
    }

    global_color_idx = 0;
    get_color_by_id(id){
        let idx = parseInt(id);

        if (!idx)
        {
            idx = this.global_color_idx;
            this.global_color_idx += 1;
        }

        idx %= 33;
        idx = idx*19 % 33;

        return {
            x: idx*8/256.0,
            y: 1- idx*8/256.0,
            z: (idx<16)?(idx*2*8/256.0):((32-idx)*2*8/256.0),
        };
    }

    get_color_by_category(category){
        let target_color_hex = parseInt("0x"+this.get_obj_cfg_by_type(category).color.slice(1));
        
        return {
            x: (target_color_hex/256/256)/255.0,
            y: (target_color_hex/256 % 256)/255.0,
            z: (target_color_hex % 256)/255.0,
        };
    }

    get_obj_cfg_by_type(name){
        if (this.obj_type_map[name]){
            return this.obj_type_map[name];
        }
        else{
            return this.obj_type_map["Unknown"];
        }
    }

    // name_array = []

    // build_name_array(){
    //     for (var n in this.obj_type_map){
    //         name_array.push(n);
    //     }
    // }


    // get_next_obj_type_name(name){

    //     if (name_array.length == 0)    {
    //         build_name_array();
    //     }

    //     var idx = name_array.findIndex(function(n){return n==name;})
    //     idx+=1;
    //     idx %= name_array.length;

    //     return name_array[idx];
    // }

}


let globalObjectCategory = new ObjectCategory();

export {globalObjectCategory};