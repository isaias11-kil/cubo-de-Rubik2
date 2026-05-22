// frontend/src/utils/cubeSolver.js
import Cube from 'cubejs';

let motorIniciado = false;

export const solveRubik = (cubeState) => {
  try {

    if (!motorIniciado) {
      try {
        Cube.initSolver();
      } catch (e) {
        console.warn("El motor ya estaba iniciado o no requiere initSolver");
      }

      motorIniciado = true;
    }

    const colorToFace = {
      [cubeState.U[4]]: 'U',
      [cubeState.R[4]]: 'R',
      [cubeState.F[4]]: 'F',
      [cubeState.D[4]]: 'D',
      [cubeState.L[4]]: 'L',
      [cubeState.B[4]]: 'B',
    };

    let cubeString = "";
    const order = ['U', 'R', 'F', 'D', 'L', 'B'];

    for (const face of order) {
      for (let i = 0; i < 9; i++) {

        const color = cubeState[face][i];

        if (!color) {
          throw new Error(`Falta color en ${face}[${i}]`);
        }

        cubeString += colorToFace[color];
      }
    }

    console.log("Cube String:", cubeString);

    const cube = Cube.fromString(cubeString);

    if (cube.isSolved()) {
      return "";
    }

    return cube.solve();

  } catch (error) {
    console.error("❌ Error resolviendo el cubo:", error);
    return "ERROR_AL_RESOLVER";
  }
};