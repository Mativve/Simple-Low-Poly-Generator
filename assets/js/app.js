(function(Vue){
    
    let app = new Vue({
        el: '#app',
        data: {
            image: null,
            sidebar: "settings",
            help: false,
            customColors: false,
            pickGradient: 0,
            arrayColors:[],
            downloading: false,
            darkTheme: false,
            pickrs: [],
            cfg:{
                width: 1920,
                height: 1080,
                cell_size: 120,
                variance: 1,
                seed: null,
                x_colors: ["#ff9a9e", "#fad0c4", "#fad0c4"]
            },
            def_cfg:{
                width: 1920,
                height: 1080,
                cell_size: 120,
                variance: 1,
                seed: null,
                x_colors: ["#ff9a9e", "#fad0c4", "#fad0c4"]
            }
        },
        methods: {
            toggleHelp: function(){
                this.help = !this.help;
            },

            applyTheme: function(){
                document.body.setAttribute("data-theme", (this.darkTheme) ? "dark" : "");
            },

            toggleTheme: function(){
                this.darkTheme = !this.darkTheme;

                localStorage.setItem("darkTheme", this.darkTheme);

                this.applyTheme();
            },

            initLocalStorage: function(){
                if( !localStorage.getItem("darkTheme") ){
                    localStorage.setItem("darkTheme", false);
                }

                this.darkTheme = (localStorage.getItem("darkTheme") == "true") ? true : false;

                this.applyTheme();
            },

            addColor: function(){
                this.cfg.x_colors.push( this.cfg.x_colors[ this.cfg.x_colors.length-1 ] );

                this.onUpdate();

                setTimeout(this.reinitColorPicker, 100);
            },

            mirrorColors: function(){
                const mirror = this.cfg.x_colors.reverse();
                this.cfg.x_colors = [];
                this.cfg.x_colors = mirror;

                this.onUpdate();
            },

            shuffleColors: function(){
                const shuffled = shuffle(this.cfg.x_colors);
                this.cfg.x_colors = [];
                this.cfg.x_colors = shuffled;

                this.onUpdate();
            },

            reinitColorPicker: function(){
                this.pickrs = [];
                let arr = [];

                document.querySelectorAll('.color-generator .color-picker').forEach(function(el, i){
                    let id = el.getAttribute("id");
                    let input = document.getElementById(id);
                    let color = el.getAttribute("data-default-color");

                    console.log(id);

                    
                    let p = Pickr.create({
                        el: "#"+id,
                        theme: 'nano',
                        useAsButton: true,
                        defaultRepresentation: 'HEX',
                        lockOpacity: true,
                        default: color,
                        components: {
                            preview: true,
                            opacity: false,
                            hue: true,
                            interaction: {
                                hex: false,
                                rgba: false,
                                hsla: false,
                                hsva: false,
                                cmyk: false,
                                input: true,
                                clear: false,
                                save: true
                            }
                        },
                    });

                    p.on('change', (color) => {
                        const c = color.toHEXA().join("");

                        input.value = "#" + c;
                        app.cfg.x_colors[i] = "#" + c;

                        input.style.background = "#" + c;
                        input.style.color = app.invertColor("#" + c);
                    });

                    arr.push(p);
                });

                this.pickrs = arr;
            },
            
            setSidebar: function(tab){
                if( !tab ){ return false; }
    
                this.sidebar = tab;

                if( this.sidebar == "colors" ){
                    setTimeout(this.reinitColorPicker, 100);
                }
            },
    
            returnFormatNumberString: function(val){
                let v = parseFloat(val);
                v = (v > 0) ? (v / 10) : v;
                v = ( (v < 10) ? "0" : "" ) + v.toFixed(2);
    
                return v;
            },
    
            checkDimension: function(){
                if( this.cfg.width > 2560 ){ this.cfg.width = 2560; }
                if( this.cfg.width < 1 ){ this.cfg.width = 1; }

                if( this.cfg.height > 2560 ){ this.cfg.height = 2560; }
                if( this.cfg.height < 1 ){ this.cfg.height = 1; }
            },
    
            checkSeed: function(){
                if( this.cfg.seed != null && this.cfg.seed.length <= 0 ){
                    this.cfg.seed = null;
                }
            },
    
            checkCellSize: function(){
                if( this.cfg.cell_size != null && this.cfg.cell_size < 50 ){
                    this.cfg.seed = 50;
                }
                else if( this.cfg.cell_size != null && this.cfg.cell_size > 300 ){
                    this.cfg.seed = 300;
                }
            },

            randomSeed: function(){
                this.cfg.seed = random_string(12);

                this.checkSeed();
                this.renderTriangles();
            },
    
            renderTriangles: function(){
                if( this.cfg.width < 1 && this.cfg.height < 1 ){ return false; }

                let cfg = this.cfg;
    
                let pa_cfg = {
                    width: parseInt(cfg.width),
                    height: parseInt(cfg.height),
                    cell_size: parseFloat(cfg.cell_size),
                    variance: parseFloat(cfg.variance),
                    seed: cfg.seed,
                    x_colors: (this.customColors) ? def_cfg.x_colors : cfg.x_colors,
                };

                // Rotate 
                
                this.image = Trianglify(pa_cfg);
    
                document.getElementById("trianglify").innerHTML = "";
                document.getElementById("trianglify").appendChild(this.image.canvas());
            },

            setGradient: function(id){
                if( this.cfg.width <= 0 && this.cfg.height <= 0 ) return false;
                
                this.cfg.x_colors = this.arrayColors[id].colors;
                this.pickGradient = id;

                this.renderTriangles();
            },

            leadZero: function(v){
                if( v < 10 ){ return "0"+v; }
                return v;
            },

            returnFilename: function(){
                let date = new Date();

                let day = this.leadZero(date.getDate());
                let month = this.leadZero(date.getMonth()+1);
                let year = this.leadZero(date.getFullYear());

                let hours = this.leadZero(date.getHours());
                let minutes = this.leadZero(date.getMinutes());
                let seconds = this.leadZero(date.getSeconds());

                let dimension = `${this.cfg.width}x${this.cfg.height}`;

                let format = `simple_low_poly_generator_${day}${month}_${hours}${minutes}${seconds}_${dimension}.png`;

                return format;
            },

            generatePng: function(){
                this.downloading = true;

                let pngURI = this.image.png();
                
                let download_link = document.createElement("a");
                download_link.href = pngURI;
                download_link.download = this.returnFilename();

                this.downloading = false;

                download_link.click();
            },
    
            onUpdate: function(){
                console.log("UPDATE");

                this.checkDimension();
                this.checkCellSize();
                this.checkSeed();
    
                this.renderTriangles();
            },
    
            getColorList: async function(){
                await request({url: "assets/js/palette.json"})
                .then(function(data){
                    let colors = JSON.parse(data);

                    colors.forEach(function(el, i){
                        let gradient = el.colors;
                        gradient = gradient.map(Function.prototype.call, String.prototype.trim);
                        gradient = gradient.join(",");

                        let st = `background:linear-gradient(to right, ${gradient});`;

                        el.style = st.toString();
                    });
    
                    app.arrayColors = colors;
                    console.log(colors);
                })
                .catch(function(error){
                    console.log(error);
                });

                
                this.setGradient( Math.floor(Math.random() * this.arrayColors.length) );
            },
            
            invertColor: function(hex) {
                if (hex.indexOf('#') === 0) {
                    hex = hex.slice(1);
                }
                // convert 3-digit hex to 6-digits.
                if (hex.length === 3) {
                    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
                }
                if (hex.length !== 6) {
                    throw new Error('Invalid HEX color.');
                }
                let r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);

                // http://stackoverflow.com/a/3943023/112731
                return ((r * 0.299 + g * 0.587 + b * 0.114) > 186) ? '#000000' : '#FFFFFF';
            },

            reset: function(){
                if( confirm("Are you sure?") ){
                    let seed = this.cfg.seed;

                    this.cfg = Object.assign({}, this.def_cfg);
                    this.cfg.seed = seed;
    
                    this.onUpdate();
                }
            }
        },
    
        mounted: function(){
            this.initLocalStorage();

            this.onUpdate();
            this.getColorList();
            this.randomSeed();
        }
    });
})(Vue);