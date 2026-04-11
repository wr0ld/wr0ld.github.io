
# Quantum Fractal Explorer

Quantum Fractal Explorer is an advanced real-time visualization project that harnesses the power of ray marching and GLSL shaders to render a dynamic, pulsating, and seemingly infinite fractal. This project creates an immersive experience reminiscent of quantum phenomena, blending fractal geometry with cosmic post-processing effects.

## Overview

Quantum Fractal Explorer uses a custom fragment shader to ray march a Mandelbulb-like fractal on a full-screen quad. The fractal’s parameters—such as power, iteration count, and bloom strength—oscillate over time to create a continuous pulsation effect. Additionally, the foreground and background colors transition to complementary hues with each pulse, enhancing the visual impact.

## Algorithm Details

### Ray Marching
- **Ray Casting:**  
  For each pixel, a ray is cast from the camera's position through the fragment. The ray's direction is computed based on the camera’s orientation, ensuring proper perspective.
  
- **Distance Estimation:**  
  A distance estimator function (`mandelbulbDE`) approximates the shortest distance from a point in space to the fractal surface. This function iteratively transforms the point using a Mandelbulb formula and updates a derivative factor to gauge the rate of change.
  
- **Iteration and Termination:**  
  The algorithm iterates the fractal transformation up to a user-controlled maximum (pulsing between 1 and 3 effective iterations). It terminates when the estimated distance is below a set threshold (indicating a hit) or when the ray travels beyond a maximum distance.
  
- **Shading:**  
  The distance traveled by the ray influences the final color, creating a gradient that conveys depth. This shading, combined with the bloom effect, produces an ethereal glow.

### Pulsation and Dynamic Effects
- **Power Oscillation:**  
  The fractal’s power parameter dynamically oscillates from 0 to 16. This alters the fractal's complexity and shape in real time.
  
- **Iteration Pulsing:**  
  The number of iterations used in the distance estimator pulses between 1 and 3, subtly changing the level of detail.
  
- **Bloom Strength:**  
  A post-processing bloom effect is applied, with its strength pulsing up to 1.6 to create a vibrant, glowing appearance.
  
- **Color Complementation:**  
  With every pulsation cycle, the fractal’s foreground color and the background color shift to complementary hues, providing a continuously evolving and visually striking contrast.

### Technical Implementation
- **GLSL Shader:**  
  The heart of the rendering is a GLSL fragment shader that implements ray marching for the fractal. Uniforms like `uTime`, `uResolution`, `uIterations`, `uPower`, `uZoom`, and camera matrices are passed to dynamically control the visualization.
  
- **Post-Processing:**  
  The scene is rendered using Three.js and enhanced with an UnrealBloomPass to achieve a soft, glowing effect.
  
- **User Interaction:**  
  While the fractal pulsates automatically, OrbitControls allow users to orbit and explore the scene from different angles.

## Usage

Quantum Fractal Explorer is designed to run in modern browsers that support WebGL, JavaScript modules, and import maps. Simply open the provided `index.html` file to experience the pulsating fractal visualization.

## Conclusion

Quantum Fractal Explorer is a fusion of art and technology, offering a window into the beauty of infinite fractal geometry through advanced shader programming and real-time rendering techniques. Dive in and explore the quantum depths of this dynamic, ever-changing fractal world!

