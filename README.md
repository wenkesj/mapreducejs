# mapreduce.js #

```sh
npm i mapreducejs --save
```

## Node.js ##
```js
var Master = require('mapreducejs/master');
var Agent = require('mapreducejs/agent');
```

## Browser ##
```html
<script src="agent.min.js"></script>
```

## Master ##
```js
var Master = require('mapreducejs/master');
// Supply an socket.io instance
var master = new Master(io);

...
// Connect to agent
master.connect(socket);
```

## Agent ##
```js
var Agent = require('mapreducejs/agent');
// or <script src="agent.min.js"></script>
var agent = new Agent();

...
// Connect to master
// Supply an socket.io instance
agent.connect(socket);
```

# Examples #
[See the examples!](https://github.com/wenkesj/mapreducejs/blob/master/example)
