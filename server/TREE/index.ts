import { v4 as uuidv4 } from 'uuid';
type NodeOrNull = NodeTree|null;

export type DTO = {
    id: string,
    name: string,
    child: Array<DTO>
}

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

    public getID() {
        return this.id;
    }

    public getDTO(maxLevel: number): DTO {
        return {
            id: this.getID(),
            name: this.getTitle(),
            child: !!maxLevel ? this.children.map(item => item.getDTO(maxLevel--)) : []
        }
    }
}


export class Tree {
    private root: NodeTree;

    constructor(root: NodeTree) {
        this.root = root;
    }

    public findBFS(cb: (item: NodeTree) => boolean): NodeOrNull{
        let queue: Array<NodeTree> = [this.root];
        let current: NodeTree;
        let match: NodeOrNull = null;
        const keys: Array<string> = [];

        while (queue.length > 0) {
            current = queue.shift() as NodeTree;
            const status: boolean = cb(current);
            const key = current.getID();
            if (!status) {
                if (!keys.includes(key)) {
                    queue.push(...current.getChild());
                }
            }else {
                queue = [];
                match = current;
            }
            keys.push(key);
        }

        return match
    }

    public getNext(id: string): NodeOrNull {
        let queue: Array<NodeTree> = [this.root];
        let current: NodeTree;
        let match: NodeOrNull = null;
        const cb = (item: NodeTree) => item.getID() === id;
        const keys: Array<string> = []

        while (queue.length > 0) {
            current = queue.shift() as NodeTree;
            const status: boolean = cb(current);
            const key = current.getID();
            if (!status) {
                if (!keys.includes(key)) {
                    queue.push(...current.getChild());
                }
            }else {
                match = queue.shift() || null;
                queue = [];
            }
            keys.push(key);
        }

        return match
    }

    public getRoot(): NodeTree {
        return this.root
    }

    public getDTO(maxLevel = 2) {
        const root = this.getRoot()
        return  root.getDTO(maxLevel)
    }
}

