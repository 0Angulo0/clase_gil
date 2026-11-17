/*
 ~ Hecho por: Daniela Angulo - A01028153, basado en el código de Gilberto Echeverria
 ? El código dibuja la cara en 2d y aplica las transformaciones que pide el usuario
 ? por el menu.
 Img de referencia para la cara (keroppi): https://www.google.com/url?sa=t&source=web&rct=j&url=https%3A%2F%2Ftwinkleglory.com.
 au%2Fcollections%2Fkeroppi%3Fsrsltid%3DAYCX9vJBjUmXONW-siMtj5-b45_e4_HhAQDuCiAO4BaoIDriZOSzcLg5&ved=0CBcQjRxqFwoTCK
 i8xpfijZgDFQAAAAAdAAAAABA3&opi=89978449
 */

'use strict';

//? importa funciones de otros archivos para que funcione
import * as twgl from 'twgl-base.js';
import GUI from 'lil-gui';
import { V2, M3, type Vec2, type Mat3 } from '../libs/2d-lib.js';
import { Scene } from '../libs/scene.js';
import { type Color } from '../libs/color.js';

//? importa los shaders
import vsGLSL from './vs_matrices_vcolor.glsl?raw';
import fsGLSL from './fs_vertex_color.glsl?raw';

//? funcion que dibuja la cara
function dibuja(radius: number) : twgl.Arrays {
    //arreglos vacios al inicio
    const positionData: number[] = [];  //coordenadas como pares de elementos
    const colorData: number[] = []; //colores con 3 valores (RGB) y otro para la opacidad
    const indexData: number[] = [];  //3 valores por triangulo, indice por el order en que están conectados los vertices
    const segments = 50;  //numero de triangulos de cada elipse

    //? funcion para dibujar elipses, asi la puedo modificar para la cara, ojos y mejillas
    function elipse(cx: number, cy: number, rx: number, ry: number, color: number[]) {
        const center = positionData.length / 2;  //indice que tendra el vertice del centro
        const c = [color[0] / 255, color[1] / 255, color[2] / 255, 1]; //los colores los mando en rgb y aca los divido 
        positionData.push(cx, cy);  //vertice del centro
        colorData.push(...c); //el ... saca los 4 numeros del arreglo
        for (let i = 0; i < segments; i++) {
            const angle = (2 * Math.PI * i) / segments;
            positionData.push(cx + rx * Math.cos(angle), //x usa el radio horizontal
                              cy + ry * Math.sin(angle)); //y usa el radio vertical
            colorData.push(...c);
        }
        for (let i = 0; i < segments; i++) {
            indexData.push(center, center + 1 + i,
                           center + 1 + ((i + 1) % segments));
        }
    }

    //& cara: ovalo verde donde el ancho es mayor al alto, con un borde negro
    elipse(0,0,radius * 1.5, radius * 1.05, [0, 0, 0]) //borde negro
    elipse(0,0,radius * 1.4, radius / 1.05, [219, 226, 71]) //ovalo verde


    //& ojos: 3 circulos encimados, uno para el borde, uno blanco y otro para las pupilas
    const radioOjos = radius / 1.6
    elipse(100, 120, radioOjos * 1.15, radioOjos * 1.15, [0, 0, 0]) //borde negro derecho                                                 
    elipse(-100, 120, radioOjos * 1.15, radioOjos * 1.15, [0, 0, 0]) //borde negro izquierdo                                                 
    elipse(100, 120, radioOjos, radioOjos, [255, 255, 255]) //circulo blanco derecho                                                 
    elipse(-100, 120, radioOjos, radioOjos, [255, 255, 255]) //circilo blanco izquierdo 
    elipse(-50, 100, radius/6, radius/6, [0,0,0]) //borde negro derecho                                                 
    elipse(50, 100, radius/6, radius/6, [0,0,0]) //borde negro derecho                                                 
                                                
    //& chapitas: dos circulos rositas al costado de la boca
    elipse(140, -50, radius/5, radius/5, [239, 167, 216]) //chapita derecha
    elipse(-140, -50, radius/5, radius/5, [239, 167, 216]) //chapita izquierda

    //& boca: una v de color negra, cada lado es un paralelogramo (4 vertices, 2 triangulos)
    const g = 20;  //grosor de la linea
    for (const lado of [-1, 1]) {  //-1 = izquierdo, 1 = derecho
        const base = positionData.length / 2  //primer vertice 
        //& a: orilla de la boca
        const ax = lado * 100, ay = -95
        //& b: punta de la v
        const bx = 0, by = -155 
        
        /* figura que seguiran los triangulos
        3---2
        | / |
        0---1*/
        positionData.push(ax, ay, // es solo la orilla
                          bx, by, // es la punta del centro
                          bx, by + g, // es el centro más el grosor
                          ax, ay + g) //es la orilla más grosor
        for (let i = 0; i < 4; i++) {
            colorData.push(0, 0, 0, 1)  
        }
        indexData.push(base, base + 1, base + 2, //triangulo 0, 1, 2
                       base, base + 2, base + 3)  //triangulo 0, 2, 3
    }

    //objeto final con posiciones, colores e indices
    const arrays: twgl.Arrays = {
        a_position: { numComponents: 2, data: positionData },
        a_color:    { numComponents: 4, data: colorData },
        indices:    { numComponents: 3, data: indexData },
    };

    return arrays;
}

//? funcion que dibuja el rombo para pivote
function pivote(size: number) : twgl.Arrays {
    let arrays = {
        a_position: {
            numComponents: 2,
            data: [
                // A diamond shape
                size, 0,
                0, size,
                -size, 0,
                0, -size,
            ]
        },
        a_color: {
            numComponents: 4,
            data: [  //color en rgb 232, 1, 50 enrte 255
                0.9098, 0.0039, 0.196, 1,
                0.9098, 0.0039, 0.196, 1,
                0.9098, 0.0039, 0.196, 1,
                0.9098, 0.0039, 0.196, 1,
            ]
        },
        indices: {
            numComponents: 3,
            data: [
                // Front face
                0, 1, 2,
                2, 3, 0,
            ]
        }
    };

    return arrays;
}

//& opciones del orden de las transformaciones, cada opcion es un arreglo de letras
const ORDERS: Record<string, string[]> = {
    'scale -> rotation -> translation': ['s', 'r', 't'],
    'scale -> translation -> rotation': ['s', 't', 'r'],
    'translation -> scale -> rotation': ['t', 's', 'r'],
    'rotation -> translation -> scale': ['r', 't', 's'],
    'rotation -> scale -> translation': ['r', 's', 't'],
};

class RotationScene extends Scene {
    //? orden seleccionado en el menu 
    order: string = 'scale -> translation -> rotation';

    constructor(gl: WebGL2RenderingContext) {
        super(gl, vsGLSL, fsGLSL);

        // crea los objetos de la escena
        const model = this.addObject('model', dibuja(150),  //llama la funcion para dibujar la cara con radio de 150
            [ Math.random(), Math.random(), Math.random(), 1 ]); //y un pbjeto random que cambia con lo que dibuja le dice
        model.transforms.t.x = gl.canvas.width / 2;
        model.transforms.t.y = gl.canvas.height / 2;

        const pivot = this.addObject('pivot', pivote(20), // llama la funcion para dibujar el pivote con tamaño de 20
            [ 0.6, 0.6, 0.6, 1]);
        pivot.transforms.t.x = gl.canvas.width / 2;
        pivot.transforms.t.y = gl.canvas.height / 2;
    }

    //? funcion para dibujar la escena
    protected render(): void {
        const { gl, programInfo } = this;
        const model = this.getObject('model');
        const pivot = this.getObject('pivot');

        //& vectores con los valores que vienen del menu
        //a donde se mueve
        const v2_trans: Vec2 = V2.create(model.transforms.t.x, model.transforms.t.y);
        //cuanto se estira en x y en y 
        const v2_scale: Vec2 = V2.create(model.transforms.s.x, model.transforms.s.y);
        // vector negativo del pivote: para caminar el pivote hacia atras
        const v2_pivot_to_center: Vec2 = V2.create(-pivot.transforms.t.x,
                                                   -pivot.transforms.t.y);
        // vector positivo del pivote: camina el pivote hacia enfrente
        const v2_center_to_pivot: Vec2 = V2.create(pivot.transforms.t.x,
                                                   pivot.transforms.t.y);

        //& matrices de cada transformacion
        const scaleMatrix: Mat3 = M3.scale(v2_scale);  // escala
        const translateMatrix: Mat3 = M3.translation(v2_trans); // traslacion
        const pivotToCenterMatrix: Mat3 = M3.translation(v2_pivot_to_center); // pivote al origen
        const rotationMatrix: Mat3 = M3.rotation(model.transforms.rr.z); // rotacion 
        const centerToPivotMatrix: Mat3 = M3.translation(v2_center_to_pivot); // origen al pivote

        //& rotacion alrededor del pivote
        let rotPivotMatrix: Mat3 = M3.identity();
        rotPivotMatrix = M3.multiply(pivotToCenterMatrix, rotPivotMatrix); // 1. pivote al origen
        rotPivotMatrix = M3.multiply(rotationMatrix, rotPivotMatrix); // 2. gira
        rotPivotMatrix = M3.multiply(centerToPivotMatrix, rotPivotMatrix); // 3. regresa al pivote

        // relaciona cada letra con su matriz
        const steps: Record<string, Mat3> = {
            s: scaleMatrix,
            t: translateMatrix,
            r: rotPivotMatrix,
        };

        //& matriz compuesta: junta todas las transformaciones en una sola matriz
        let modelTransforms: Mat3 = M3.identity(); 
        for (const letra of ORDERS[this.order]) {
            modelTransforms = M3.multiply(steps[letra], modelTransforms);
        }

        gl.useProgram(programInfo.program);  //usa los shaders

        //& dibuja la cara
        //valores que son iguales para todos los vertices y se mandan al shader
        let uniforms = {
            u_resolution: [gl.canvas.width, gl.canvas.height],
            u_transforms: modelTransforms,
            u_color: model.color,
        };
        twgl.setUniforms(programInfo, uniforms); //manda los uniforms al shader
        gl.bindVertexArray(model.vao); //selecciona el VAO de la cara
        twgl.drawBufferInfo(gl, model.bufferInfo); //dibuja los triangulos de la cara

        //& dibuja el pivote
        const translateMatrixPivot: Mat3 = M3.translation(v2_center_to_pivot);
        let pivotTransforms: Mat3 = M3.identity();
        pivotTransforms = M3.multiply(translateMatrixPivot, pivotTransforms);

        uniforms = {
            u_resolution: [gl.canvas.width, gl.canvas.height],
            u_transforms: pivotTransforms,
            u_color: pivot.color,
        };
        twgl.setUniforms(programInfo, uniforms);
        gl.bindVertexArray(pivot.vao);  //VAO del pivote 
        twgl.drawBufferInfo(gl, pivot.bufferInfo);
    }

    setupUI(): void {
        const { gl } = this;
        const model = this.getObject('model');
        const pivot = this.getObject('pivot');

        const gui = new GUI();

        //& menu desplegable
        gui.add(this, 'order', Object.keys(ORDERS)).name('Order');

        const modelFolder = gui.addFolder('Model');

        const traFolder = modelFolder.addFolder('Translation');
        traFolder.add(model.transforms.t, 'x', 0, gl.canvas.width)
            .onChange((value: number) => {
                model.transforms.t.x = value;
            });
        traFolder.add(model.transforms.t, 'y', 0, gl.canvas.height)
            .onChange((value: number) => {
                model.transforms.t.y = value;
            });

        const rotFolder = modelFolder.addFolder('Rotation');
        rotFolder.add(model.transforms.rr, 'z', 0, Math.PI * 2)
            .onChange((value: number) => {
                model.transforms.rr.z = value;
            });

        const scaFolder = modelFolder.addFolder('Scale');
        scaFolder.add(model.transforms.s, 'x', -5, 5)
            .onChange((value: number) => {
                model.transforms.s.x = value;
            });
        scaFolder.add(model.transforms.s, 'y', -5, 5)
            .onChange((value: number) => {
                model.transforms.s.y = value;
            });
        const pivotFolder = gui.addFolder('Pivot');
        const pivotTraFolder = pivotFolder.addFolder('Translation');
        pivotTraFolder.add(pivot.transforms.t, 'x', 0, gl.canvas.width)
            .onChange((value: number) => {
                pivot.transforms.t.x = value;
            });
        pivotTraFolder.add(pivot.transforms.t, 'y', 0, gl.canvas.height)
            .onChange((value: number) => {
                pivot.transforms.t.y = value;
            });
    }
}

// ? main que jala el canvas, devuelve las funciones de webgl, dibuja y pone el menu
function main(): void {
    const canvas = document.querySelector('canvas'); //jalamos el canvas para trabajar
    if (!canvas) {
        throw new Error('No canvas element found in the document');
    }

    const gl = canvas.getContext('webgl2'); // devuelve un objeto con las funciones de webgl
    if (!gl) {
        throw new Error('WebGL2 is not supported by this browser');
    }

    const scene = new RotationScene(gl);
    scene.setupUI();
    scene.draw(0);
}

main()  //llamamos main
