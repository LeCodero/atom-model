# atom-model

Atom Model is a Python model using the three.js library to visualize the structure of atoms with the Bohr model.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install atom-model.

```bash
npm install atom-model
```

## Usage
Here is an example of usage permitting to visualise a Tennessine atom on a web page.

```javascript
import * as ATOM from "atom-model"

var atom = new ATOM.Atom(ATOM.Elements.TENNESSINE)
atom.animate();
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)