/* core/professor/presets.js — dados: paleta de cores + presets do painel do professor */
export const COLORS = ["#ffa500","#ffd23f","#60a5fa","#34d399","#a78bfa","#fb923c"];

export const PRESET_GROUPS = [
  { title:"Exponencial", items:[
    { label:"2ˣ vs ½ˣ",   fns:["y=2^x","y=(1/2)^x"],           pi:false, uc:false },
    { label:"Bases > 1",   fns:["y=2^x","y=3^x","y=10^x"],       pi:false, uc:false },
    { label:"Juros 3%",    fns:["y=1800*(1.03)^x"],               pi:false, uc:false, view:{xmin:0,xmax:30,ymin:0,ymax:5000} },
    { label:"Decaimento",  fns:["y=100*(0.5)^x"],                 pi:false, uc:false, view:{xmin:0,xmax:10,ymin:0,ymax:110} },
  ]},
  { title:"Sequências", items:[
    { label:"PA  r=5",     fns:["y=3+(x-1)*5"],                   pi:false, uc:false, view:{xmin:0,xmax:10,ymin:-5,ymax:50} },
    { label:"PG  q=2",     fns:["y=2*2^(x-1)"],                   pi:false, uc:false, view:{xmin:0,xmax:8,ymin:-2,ymax:60} },
    { label:"PA vs PG",    fns:["y=5+(x-1)*5","y=5*1.5^(x-1)"],   pi:false, uc:false, view:{xmin:0,xmax:14,ymin:-5,ymax:100} },
  ]},
  { title:"Trigonometria", items:[
    { label:"sin(x)",      fns:["y=sin(x)"],                      pi:true,  uc:true  },
    { label:"cos(x)",      fns:["y=cos(x)"],                      pi:true,  uc:true  },
    { label:"tan(x)",      fns:["y=tan(x)"],                      pi:true,  uc:true,  view:{xmin:-Math.PI,xmax:Math.PI,ymin:-4,ymax:4} },
    { label:"sin + cos",   fns:["y=sin(x)","y=cos(x)"],           pi:true,  uc:true  },
    { label:"Círculo unit.",fns:[],                                pi:false, uc:true  },
  ]},
  { title:"Álgebra", items:[
    { label:"Parábola",    fns:["y=x^2","y=x^2-4"],               pi:false, uc:false },
    { label:"Raízes",      fns:["y=sqrt(x)","y=x^(1/3)"],         pi:false, uc:false, view:{xmin:-3,xmax:8,ymin:-3,ymax:4} },
  ]},
];
