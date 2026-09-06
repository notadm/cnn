import Data from './mnist.json'
import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Color } from 'three';
import { Text, OrbitControls, TransformControls, ContactShadows, useGLTF, useCursor,  Instances, Instance, Line } from '@react-three/drei'
import * as THREE from 'three';
import anime from 'animejs';


function print(x) { console.log(x) }
const LAYERS = [784, 6084, 1521, 1936, 2025, 225, 64, 16, 10, 10]
const TOTAL_NODES = LAYERS.reduce((x, a) => x+a, 0);
const ACCUMULATE_LAYERS = (i) => new Array(i).fill(0,0,i).map((x,j) => LAYERS[j]).reduce((x,a) => a + x, 0) 
const ACCUMULATED_LAYERS = new Array(LAYERS.length+1).fill(0,0,LAYERS.length+1).map((x,i) => ACCUMULATE_LAYERS(i))
const COLORS = {0x03: 0xFF0000,0x02: 0xFF00FF, 0x01: 0x0000FF, 0x00: 0x000000 }
const TOTAL_ACTIVATIONS = atob(Data.activations[0]).length
let ACTIVATIONS = new Array(TOTAL_NODES).fill(0)
for (let i=0; i<TOTAL_NODES; i++) {
		let A = atob(Data.activations[i])
		let B = new Uint8Array(TOTAL_ACTIVATIONS)
		for (let j=0; j<TOTAL_ACTIVATIONS; j++) { B[j] = A.charCodeAt(j) }
		ACTIVATIONS[i] = B
}
const ARANGE = (start,end) => [...Array(end-start).keys()].map((x) => x + start) 
const SHUFFLE = (start,end) => ARANGE(start,end).sort( () => .5 - Math.random() ) 
const SHUFFLE_LAYER = (k) => SHUFFLE(ACCUMULATED_LAYERS[k], ACCUMULATED_LAYERS[k+1]) 
const SHUFFLED_NODES = new Array(LAYERS.length).fill(null,0,LAYERS.length).map((x,k) => SHUFFLE_LAYER(k))
const PARTITION = (x, n) => { let o=[]; for (let i=0; i<x.length; i+=n) { o[o.length] = x.slice(i, i+n); } return o; }
const SHUFFLED = new Array(LAYERS.length).fill(0).map((x,i) => PARTITION(SHUFFLED_NODES[i], SHUFFLED_NODES[i].length*0.1))


let edge_count = 0
const EDGES = {} 
const EDGE = (i,j) => { EDGES[edge_count] = [Data.positions[i], Data.positions[j]]; edge_count++; return edge_count-1 }
const GEN_EDGES = (i) => { let b=Data.base[i]; let A=[]; for (let j=0;j<Data.type[Data.edges[i]].length;j++) { A.push(EDGE(i,b)); b += Data.type[Data.edges[i]][j]; } return A; }
const INIT_EDGES = (i) => { if (Data.base[i] == -1) return []; if (Data.edges[i] == -1) return [EDGE(i,Data.base[i])]; return GEN_EDGES(i) }
const NODE_EDGES = new Array(TOTAL_NODES).fill([]).map((x,i) => INIT_EDGES(i))


let cnn = false
let loadedLayers = new Array(LAYERS.length).fill(0) 
let bytepos = 0 
let bitpos = 0 

const rand_color = () => new THREE.Color(Math.random() * 0xffffff)
const set_xyz = (p) => { const t = new THREE.Object3D(); t.position.set(p[0],p[1],p[2]); t.updateMatrix(); return t }
const set_pos = (ref,i,p) => { const t = set_xyz(p); ref.current.setMatrixAt(i, t.matrix); ref.current.instanceMatrix.needsUpdate = true; return t; }  
const set_color = (ref,i,color) => { ref.current.setColorAt( i, color ); ref.current.instanceColor.needsUpdate = true }
const init_edge = (edges,i,s,e) => {
    const t = set_pos(edges,i,s); const L = Math.sqrt( Math.pow(s[0]-e[0], 2) + Math.pow(s[1]-e[1], 2) + Math.pow(s[2]-e[2], 2) )
    t.lookAt(e[0], e[1], e[2]); t.translateZ(L/2); t.scale.set(1,1,L/1); t.updateMatrix()
    edges.current.setMatrixAt(i, t.matrix); set_color(edges, i, rand_color())
}
const init_node = (nodes, edges, i) => { 
    set_pos(nodes, i, Data.positions[i]);  set_color(nodes,i,rand_color()); 
    for (let j=0;j<NODE_EDGES[i].length;j++) {const k = NODE_EDGES[i][j]; init_edge(edges,k,EDGES[k][0],EDGES[k][1])}
}
const del_edge = (edges,i) => {
    const t = set_pos(edges,i,[-9999,-9999,-9999]); const L = 0;
    t.lookAt(-999, -999, -999); t.scale.set(1,1,L/1); t.updateMatrix()
    edges.current.setMatrixAt(i, t.matrix);
}
const del_node = (nodes, edges, i) => { 
    set_pos(nodes, i, [-9999,-9999,-9999]);
    for (let j=0;j<NODE_EDGES[i].length;j++) {del_edge(edges,NODE_EDGES[i][j])}
}
const rand_node = (nodes, edges, i) => { set_color(nodes,i,rand_color()); for (let j=0;j<NODE_EDGES[i].length;j++) {set_color(edges,NODE_EDGES[i][j], rand_color()); } }
const forward = (nodes, edges, i) => {
    const c = new THREE.Color(COLORS[ (ACTIVATIONS[i][bytepos] >> (bitpos*2)) & 0x03 ])
    set_color(nodes, i, c)
    for (let j=0;j<NODE_EDGES[i].length;j++) {set_color(edges,NODE_EDGES[i][j],c); } 
}
const update_batch = (nodes,edges,k,i,fn) => { for(let j=0;j<SHUFFLED[k][i].length;j++) { fn(nodes,edges,SHUFFLED[k][i][j]) } return SHUFFLED[k][i].length; }

const _set_layer = (nodes,edges,k,fn) => { for(let i=0;i<SHUFFLED_NODES[k].length;i++) { fn(nodes,edges,SHUFFLED_NODES[k][i]) } }
const set_layer = (nodes,edges,k,fn) => { let i=0; let t=setInterval(()=>{ if(i>=SHUFFLED[k].length-1){clearInterval(t);} update_batch(nodes,edges,k,i,fn); i++; }); }

const load_batch = (nodes,edges,k,i) => { for(let j=0;j<SHUFFLED[k][i].length;j++) { init_node(nodes,edges,SHUFFLED[k][i][j]) } }
const load_layer = (nodes,edges,k) => { let i=0; let t=setInterval(()=>{ if(i>=SHUFFLED[k].length-1){clearInterval(t);loadedLayers[k]=1;} load_batch(nodes,edges,k,i); i++; }); }
const load = (nodes,edges) => { let k=0; let t=setInterval(() => { if(k==SHUFFLED_NODES.length-1){ clearInterval(t); cnn = true; } load_layer(nodes,edges,k); k++; }, 300); }
const deload_layer = (nodes,edges,k) => { for(let i=0;i<SHUFFLED_NODES[k].length;i++) {del_node(nodes,edges,SHUFFLED_NODES[k][i])}}
const deload = (nodes,edges) => { cnn = false; let k=0; let t=setInterval(() => { if(k==SHUFFLED_NODES.length-1){ clearInterval(t);  } deload_layer(nodes,edges,k); k++; }, 300); }
const update_labels = (labels) => {
		let target = 0
		for (let i = TOTAL_NODES-10; i < TOTAL_NODES; i++) { 
				const x = ((ACTIVATIONS[i][bytepos] >> (bitpos*2)) & 0x03); 
				if (x == 0x03) {target = 10-(TOTAL_NODES-i)} 
			}
		for (let i = 0; i < 10; i++) { labels.current.parent.children[2+i].visible = false }
		labels.current.parent.children[2+target].visible = true
}
const feed_forward = (nodes, edges, labels) => {
		if (cnn == true) { 
				bytepos = Math.floor(TOTAL_ACTIVATIONS*Math.random()); bitpos = Math.floor(4*Math.random())
				let l=0; let T=setInterval(() => { if(l==SHUFFLED_NODES.length-1){ clearInterval(T); } set_layer(nodes,edges,l,rand_node); l++; }, 5);
				let k=0; let t=setInterval(() => { if(k==SHUFFLED_NODES.length-1){ update_labels(labels); clearInterval(t); } set_layer(nodes,edges,k,forward); k++; }, 50);
		}
}

export default function CNN(props) {
    const cnn_ref = useRef(null)
    const nodes = useRef(null)
    const edges = useRef(null)
    const labels = useRef(null)

		const [forwardPass, setForwardPass] = useState(0);
		setTimeout(() => { setForwardPass(forwardPass + 1) }, 1000);

    useEffect(() => {
				if(cnn == false) { load(nodes,edges) }
        //if (props.selected==true && cnn==false) { load(nodes,edges); }
        //if (props.selected==false && cnn==true) { deload(nodes,edges); }
    }, [props])

    useEffect(() => {  feed_forward(nodes,edges,labels); }, [forwardPass])
		useFrame(() => { if (cnn_ref.current != null) { cnn_ref.current.rotation.z -= 0.003 } } )

    return ( 
	<group ref={cnn_ref}>
		<instancedMesh ref={nodes} args={[null, null, TOTAL_NODES]} > 
				<boxGeometry args={[0.01,0.01,0.01]} /> 
				<meshBasicMaterial color={new THREE.Color(0xffffff)}/>
		</instancedMesh> 
		<instancedMesh ref={edges} args={[null, null, 526920]} > 
				<boxGeometry args={[0.00005,0.00005,1.0]} /> 
				<meshBasicMaterial color={new THREE.Color(0xffffff)}/>
		</instancedMesh> 
		{[...Array(10).keys()].map((x) => {return <Text visible={false} ref={labels} key={x} position={[1.1999+0.1,-0.5+(0.111111*x), 0.0]} scale={[0.05,0.05,0.05]} rotation={[-1.6,0,0]}>{x}</Text>})}
	</group>
    )
}
