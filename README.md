# atom-model

Atom Model is a javascript module using the three.js library to visualize the structure of atoms with the Bohr model.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install atom-model.

```bash
npm install atom-model
```

## Usage
Here is an example of usage permitting to visualise a Tennessine atom on a web page.

index.html :
```html
<!DOCTYPE html>
<html>
<head>
  <script type="importmap">
      {
          "imports": {
              "three": "./node_modules/three/build/three.module.js",
              "three/examples/jsm/": "./node_modules/three/examples/jsm/",
              "atom-model" : "./node_modules/atom-model/atom.js"
          }
      }
    </script>
  <title>Atom 3D Model</title>
</head>
<body>
  <script type="module" src="example.js"></script>
</body>
</html>
```

example.js:
```javascript
import * as ATOM from "atom-model"

var antimony = new ATOM.Atom(ATOM.Elements.ANTIMONY)
antimony.animate()
```

The result will be the animation of an atom of antimony:
![Pasted Graphic 2](https://user-images.githubusercontent.com/43744375/207054772-772436b3-6761-45cf-850d-6c7e96800e1c.png)


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
