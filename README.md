# MNIST CNN — 3D Visualisation

An interactive 3D visualisation of a Convolutional Neural Network (CNN) trained to recognise handwritten digits from the MNIST dataset.

The CNN is pre-trained and its inference data is precomputed before deployment. Rather than performing expensive model inference in the browser, the frontend loads the network structure and activation data from `mnist.json`.

### Performance

- **Precomputed activations** — avoids expensive CNN inference in Typescript/JavaScript.
- **Static JSON** — no backend or inference server is required.
- **Instanced rendering** — Three.js `instancedMesh` efficiently renders hundreds of thousands of nodes and edges.
- **Encoded activation data** — activations are stored compactly as bytes.
- **Client-side animation** — the browser only updates colours and transforms during the visualised forward pass.

## Packages

- React
- Next.js
- Three.js
- React Three Fiber
- Drei

## Run Locally

```bash
npm install
npm run dev
