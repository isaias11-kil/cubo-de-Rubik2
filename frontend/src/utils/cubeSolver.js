import Cube from 'cubejs';

// En Vite, si global = window, cubejs inicializa this.Cube = Cube.
// De lo contrario puede exportar en el module.
const CubeClass = typeof Cube === 'function' ? Cube : (window.Cube || globalThis.Cube || Cube.default);

if (!CubeClass) {
  console.error("Cube is undefined! 'cubejs' module did not load correctly. Here is the imported object:", Cube);
}

let motorIniciado = false;

export const solveRubik = (cubeState) => {
  if (!CubeClass) {
    console.error("No se puede resolver el cubo porque CubeClass no está definido.");
    return "ERROR_AL_RESOLVER";
  }

  try {
    if (!motorIniciado) {
      try {
        CubeClass.initSolver();
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

    const cube = CubeClass.fromString(cubeString);

    if (cube.isSolved()) {
      return "";
    }

    return cube.solve();
  } catch (error) {
    console.error("❌ Error resolviendo el cubo:", error);
    return "ERROR_AL_RESOLVER";
  }
};
