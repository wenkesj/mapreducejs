# Distributed Graph and Network Data Structures #
Baseline collection of graphs and network data structures using **socket.io**.

```sh
npm i --save network-collection
```

```sh
# New terminal
node example/server

# New terminal
node example/client
```

## Cluster ##
A standalone cluster of **Network**(s) for distributing actions through **socket** connections.

```js
let manager = new Cluster(io);
```

+ **io** - An instance of a **socket.io** server.

|    Methods    |    Actions    |
| ------------- | ------------- |
| connect(socket, callback) | Connect a **socket** and add listeners. |
| map(callback) | Map functions to each socket on the network and await the responses. `callback` is called with the socket id and index. |
| addGraph(socketId, graph) | Add a **Graph** to a specific clients network. |
| removeGraph(socketId, graphId) | Remove a **Graph** to a specific clients network. |
| addEdge(socketId, graphId, fromId, toId) | Add an **edge** from a **Node** to a **Node** to a specific clients Graph. |
| removeEdge(socketId, graphId, fromId, toId) | Remove an **edge** from a **Node** to a **Node** to a specific clients Graph. |
| addNode(socketId, graphId, node) | Add a **Node** to a specific clients Graph. |
| removeNode(socketId, graphId, nodeId) | Remove a **Node** to a specific clients Graph. |

## Network ##
A collection of **Graphs**.

```js
let network = new Network(socket, options);
```

+ **socket** - **socket** instance.
+ **options**
  + **graphs** - Collection of key(s) -> **Graph**(s)

|    Methods    |    Actions    |
| ------------- | ------------- |
| connect(socket, callback) | Connect a **socket** and add listeners. |
| addGraph(graph) | Add a **Graph** to a network. |
| removeGraph(graphId) | Remove a **Graph** to a network. |
| addEdge(graphId, fromId, toId) | Add an **edge** from a **Node** to a **Node** to a Graph. |
| removeEdge(graphId, fromId, toId) | Remove an **edge** from a **Node** to a **Node** to a Graph. |
| addNode(graphId, node) | Add a **Node** to a Graph. |
| removeNode(graphId, nodeId) | Remove a **Node** to a Graph. |

## Graph ##
A set of _N_ (**Nodes**) and _E_ **Edges**.

```js
let graph = new Graph(options);
```

+ **options**
  + **nodes** - Map of key(s) -> **Node**(s)
  + **edges** - Map of key(s) -> [from -> to] [nodeId -> **Node**] pairs(s)
  + **id** - A unique identifier string.

|    Methods    |    Actions    |
| ------------- | ------------- |
| addEdge(fromId, toId) | Add an **edge** from a **Node** to a **Node**. |
| removeEdge(fromId, toId) | Remove an **edge** from a **Node** to a **Node**. |
| addNode(node) | Add a **Node**. |
| removeNode(nodeId) | Remove a **Node**. |

## Node ##
An individual vertex (of a graph connected by an edge to another vertex).

```js
let node = new Node(options);
```

+ **options**
  + **edges** - Map of key(s) -> [from -> to] [nodeId -> **Node**] pairs(s)
  + **id** - A unique identifier string.

|    Methods    |    Actions    |
| ------------- | ------------- |
| addEdge(toId) | Add an **edge** to a **Node**. |
| removeEdge(toId) | Remove an **edge** to a **Node**. |
