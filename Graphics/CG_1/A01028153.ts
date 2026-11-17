/*
 Hecho por: Daniela Angulo - A01028153
 Basado en el código de Gilberto Echeverria
 El código dibuja la cara en 2d y aplica las transformaciones que pide el usuario
 por el menu.
 Img de referencia para la cara: https://www.google.com/url?sa=t&source=web&rct=j&url=https%3A%2F%2Ftwinkleglory.com.au%2Fcollections%2Fkeroppi%3Fsrsltid%3DAYCX9vJBjUmXONW-siMtj5-b45_e4_HhAQDuCiAO4BaoIDriZOSzcLg5&ved=0CBcQjRxqFwoTCKi8xpfijZgDFQAAAAAdAAAAABA3&opi=89978449
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

    //& cara: ovalo verde donde los triangulos comparten el mismo centro
    const segments = 50;  //numero de trinagulos 
    positionData.push(0, 0);  //primer coordenada
    colorData.push(0.796, 0.851, 0.157, 1);  //el color de keroppi es RGB (203, 217, 40), pero eso lo dividi en 255 para que lo pueda agregar
    for (let i = 0; i < segments; i++) {
        const angle = (2 * Math.PI * i) / segments;
        positionData.push(radius * Math.cos(angle), radius * Math.sin(angle));
        colorData.push(0.9, 0.8, 0, 1);
    }
    for (let i = 0; i < segments; i++) {
        indexData.push(0, 1 + i, 1 + ((i + 1) % segments));
    }

    //& Eyes: two small black circles, each made of many triangles
    const eyeRadius = radius * 0.12;                        
    const eyeY = radius * 0.3;                              
    for (const eyeX of [-radius * 0.35, radius * 0.35]) {   
        // Index of this eye's center vertex
        const center = positionData.length / 2;             
        positionData.push(eyeX, eyeY);                      
        colorData.push(0.1, 0.1, 0.1, 1);                   
        for (let i = 0; i < segments; i++) {                
            const angle = (2 * Math.PI * i) / segments;     
            positionData.push(eyeX + eyeRadius * Math.cos(angle),   
                              eyeY + eyeRadius * Math.sin(angle));  
            colorData.push(0.1, 0.1, 0.1, 1);               
        }                                                   
        for (let i = 0; i < segments; i++) {                
            indexData.push(center, center + 1 + i,          
                           center + 1 + ((i + 1) % segments));      
        }                                                   
    }                                                       

    //& Mouth: black curved band (lower part of a ring) made of many triangles
    const mouthIn = radius * 0.5;                           
    const mouthOut = radius * 0.62;                         
    const mouthStart = Math.PI * 1.15;                      
    const mouthEnd = Math.PI * 1.85;                        
    const mouthSegments = 32;                               
    const mouthFirst = positionData.length / 2;             
    for (let i = 0; i <= mouthSegments; i++) {              
        const angle = mouthStart + ((mouthEnd - mouthStart) * i) / mouthSegments; 
        positionData.push(mouthIn * Math.cos(angle), mouthIn * Math.sin(angle));   
        positionData.push(mouthOut * Math.cos(angle), mouthOut * Math.sin(angle)); 
        colorData.push(0.1, 0.1, 0.1, 1);                   
        colorData.push(0.1, 0.1, 0.1, 1);                   
    }                                                       
    for (let i = 0; i < mouthSegments; i++) {               
        const k = mouthFirst + i * 2;                       
        indexData.push(k, k + 1, k + 3);                    
        indexData.push(k, k + 3, k + 2);                    
    }                                                       

    // Build the final object with the arrays for positions, colors, and indices
    const arrays: twgl.Arrays = {
        a_position: { numComponents: 2, data: positionData },
        a_color:    { numComponents: 4, data: colorData },
        indices:    { numComponents: 3, data: indexData },
    };

    console.log(arrays);

    return arrays;
}

function diamond(size: number) : twgl.Arrays {
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
            data: [
                0.5, 0.5, 0.5, 1,
                0.5, 0.5, 0.5, 1,
                0.5, 0.5, 0.5, 1,
                0.5, 0.5, 0.5, 1,
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
/*
 ? Main function to initialize the WebGL context, create the scene, and set up the UI.
 */
function main(): void {
    const canvas = document.querySelector('canvas'); //jalamos el canvas para trabajar
    if (!canvas) {
        throw new Error('No canvas element found in the document');
    }

    const gl = canvas.getContext('webgl2'); // devuelve un objeto con las funciones de webgl
    if (!gl) {
        throw new Error('WebGL2 is not supported by this browser');
    }
/*
    const scene = new RotationScene(gl);
    scene.setupUI();
    scene.draw(0);*/
}

main()  //llamamos main
