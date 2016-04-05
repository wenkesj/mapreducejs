# mapreduce.js #

```sh
npm i mapreducejs --save
```

## Node.js ##
```js
let Master = require('mapreducejs/master');
let Agent = require('mapreducejs/agent');
```

## Browser ##
```html
<script src="agent.min.js"></script>
```

## Master ##
```js
let Master = require('mapreducejs/master');
// Supply an socket.io instance
let master = new Master(io);

...
// Connect to agent
// Returns a promise that resolves when finished connecting.
master.connect(socket);
```

### `master.source` ###
Returns an iterable `Dataset`.
```js
let dataset = master.source([...]);
```

## Dataset ##
### `dataset.data` ###
Returns the actual data.
### `dataset.map` ###
Perform a function on all entries in a list. Returns a promise that resolves the result `Dataset`.
```js
dataset.map((entry) => {
  return ...
}).then((result) => {
  ...
});
```
### `dataset.reduce` ###
Reduce a list into a single value context. Returns a promise that resolves the result `Dataset`.
```js
dataset.reduce((prev, next) => {
  return ...
}).then((result) => {
  ...
});
```

### Chaining ###
```js
dataset.map((entry) => {
  // Map
  return ...
}).then((result) => {
  // Reduce
  result.reduce((prev, next) => {
    return ...
  }).then((result) => {
    // Map
    result.map((entry) => {
      return ...
    }).then((result) => {
      let { data } = result;
    });
  });
});
```

## Agent ##
```js
let Agent = require('mapreducejs/agent');
// or <script src="agent.min.js"></script>
let agent = new Agent();

...
// Connect to master
// Supply an socket.io instance
// Returns a promise that resolves when finished connecting.
agent.connect(socket);
```

# Examples #
[See the examples!](https://github.com/wenkesj/mapreducejs/blob/master/example)
