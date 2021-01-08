import { v4 as uuidv4 } from 'uuid';
type NodeOrNull = NodeTree|null;


export class NodeTree {
    private id: string;
    private name: string;
    private children: Array<NodeTree>;

    constructor(name: string, id: string = uuidv4()) {
        this.name = name;
        this.id = id;
        this.children = [];
    }

    public addRowChild(...nodes: Array<string>) {
        nodes.forEach((item) => {
            const node = new NodeTree(item)
            this.children.push(node);
        });
    }

    public getChild(): Array<NodeTree> {
        return this.children;
    }

    public getTitle() {
        return this.name;
    }
}


export class Tree {
    private root: NodeTree;

    constructor(root: NodeTree) {
        this.root = root;
    }

    public findBFF(cb: (item: NodeTree) => boolean): NodeOrNull{
        let queue: Array<NodeTree> = [this.root];
        let current: NodeTree;
        let match: NodeOrNull = null;

        while (queue.length > 0) {
            current = queue.shift() as NodeTree;
            const status: boolean = cb(current);
            if (!status) {
                queue.push(...current.getChild());
            }else {
                queue = [];
                match = current;
            }
        }

        return match
    }
}

