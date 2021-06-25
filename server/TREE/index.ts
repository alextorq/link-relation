import { v4 as uuidv4 } from 'uuid';

type NodeOrNull = NodeTree|null;

export type DTO = {
    id: string,
    name: string,
    parent: string|null,
    child: Array<DTO>
}

export class NodeTree {
    public id: string;
    public name: string;
    private parent: NodeTree|null;
    public children: Array<NodeTree>;
    private travel: boolean;

    constructor(name: string, parent: NodeTree|null = null) {
        this.name = name;
        this.id = uuidv4();
        this.children = [];
        this.parent = parent
        this.travel = false
    }

    public addRowChild(...nodes: Array<string>) {
        nodes.forEach((item) => {
            const node = new NodeTree(item, this)
            this.addChild(node)
        });
    }

    public setTravel() {
        this.travel = true
    }

    public getNotTravel() {
        return this.children.filter(node => node.travel === false);
    }

    public addChild(node: NodeTree) {
        this.children.push(node);
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
        const level = --maxLevel
        return {
            id: this.getID(),
            parent: this.getParent()?.getID() ?? null,
            name: this.getTitle(),
            child: level > 0 ? this.children.map(item => item.getDTO(level)) : []
        }
    }

    public getParent() {
        return this.parent;
    }
}


export class Index {
    private index: {
        [key: string]: Array<string>
    };
    constructor() {
        this.index = {}
    }

    add(titles: Array<string>) {
        titles.forEach(title => {
            const firstLetters = title.charAt(0) + title.charAt(1)
            if (!this.index[firstLetters]) {
                this.index[firstLetters] = []
            }
            this.index[firstLetters].push(title)
        })
    }

    check(title: string) {
        const firstLetter = title.charAt(0) + title.charAt(1)
        if (!this.index[firstLetter]) {
            return false
        }
        return this.index[firstLetter].includes(title)
    }
}

export class Tree {
    private root: NodeTree;
    private index: Index;

    constructor(root: NodeTree) {
        this.root = root;
        this.index = new Index()
    }

    public addChildren(title: string, children: Array<string>, client = false) {
        const parentNode = this.findBFS(title)
        if (parentNode) {
            const exist: Array<string> = []
            const notAdded = children.filter(title => {
                const node = this.checkExist(title)
                if (node) {
                    exist.push(title)
                }
                return !node
            })
            this.index.add(notAdded)
            parentNode.addRowChild(...notAdded)
            exist.forEach(item => {
                const node = this.findBFS(item)
                if (node) {
                    parentNode.addChild(node)
                }
            })
        }
    }

    public checkExist(title: string) {
        return this.index.check(title)
    }

    public findBFSID(title: string): NodeOrNull{
        let queue: Array<NodeTree> = [this.root];
        let current: NodeTree;
        let match: NodeOrNull = null;
        const keys: Array<string> = [];

        while (queue.length > 0) {
            current = queue.shift() as NodeTree;
            const status = current.getID() === title
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

    public getBrunch(title: string) {
        let current = this.getRoot()
        let queue: Array<NodeTree> = [current];
        let currentPath: Array<NodeTree> = [];
        const keys: Array<string> = [];
        while(queue.length > 0) {
            current = queue.shift() as NodeTree;
            const key = current.getID()
            if (!keys.includes(key)) {
                currentPath.push(current)
                if (current.getTitle() === title) {
                    queue = []
                    break
                }
                const child = current.getChild()
                const hasChild = !!child.length

                if (hasChild) {
                    queue.unshift(...child)
                }else {
                    currentPath.pop()
                }
            }
            keys.push(key)
        }

        return currentPath
    }


    public getBrunchTop(title: string) {
        const node = this.findBFS(title)
        if (node) {
            let parent = node.getParent()
            const path: Array<NodeOrNull> = [node]
            while (parent !== null) {
                path.push(parent)
                parent = parent.getParent()
            }
            return path
        }
        return []
    }


    public findBFS(title: string): NodeOrNull {
        let queue: Array<NodeTree> = [this.root];
        let current: NodeTree;
        let match: NodeOrNull = null;
        const keys: Array<string> = [];

        while (queue.length > 0) {
            current = queue.shift() as NodeTree;
            const key = current.id;
            if (keys.includes(key)) {
                continue
            }
            if (current.name !== title) {
                queue.push(...current.getChild());
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

    public getDTO(maxLevel = 3) {
        const root = this.getRoot()
        return  root.getDTO(maxLevel)
    }
}

