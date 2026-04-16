export class Object3D {}

export class Group extends Object3D {
  position = { set: (_x: number, _y: number, _z: number) => {} };
  rotation = { set: (_x: number, _y: number, _z: number) => {} };
  scale = { set: (_x: number, _y: number, _z: number) => {} };
  add(_child: Object3D) {}
}

export default {
  Object3D,
  Group,
};

