//+--------------------------\--------------------------------
//|	        Notifier	     | (abstract)
//\--------------------------/
//	Middle-man between firebase database listeners and 
//		internal component listeners.
//\-----------------------------------------------------------
type OnUpdateFunc = (data: any) => void;
type UnregisterFunc = () => void;
abstract class Notifier {
	protected hasBeenUpdated: boolean = false;
	protected onUpdateList: OnUpdateFunc[] = [];

	register = (onUpdate: OnUpdateFunc): UnregisterFunc => {
		this.onUpdateList.push(onUpdate);

		if (this.hasBeenUpdated)
			this.catchUp(onUpdate);

		const unregister = () => {
			this.onUpdateList = this.onUpdateList.filter(element => element !== onUpdate);
		};
		return unregister;
	}
	notifyAll = (): void => {
		this.onUpdateList.forEach(onUpdate => this.notify(onUpdate));
	}
	hasListeners = (): boolean => {
		return this.onUpdateList.length > 0;
	}

	abstract update(data: any): void;
	abstract notify(onUpdate: OnUpdateFunc): void;
	abstract catchUp(onUpdate: OnUpdateFunc): void;
};

//+--------------------------\--------------------------------
//|	     ValueNotifier       |
//\--------------------------/
//	Notifies of entire node on every update
//\-----------------------------------------------------------
class ValueNotifier extends Notifier {
	protected data: any = {};

	update = (data: any): void => {
		this.data = data;

		if (!this.hasBeenUpdated)
			this.hasBeenUpdated = true;

		this.notifyAll();
	}
	notify = (onUpdate: OnUpdateFunc): void => {
		onUpdate({ ...this.data });
	}
	catchUp = (onUpdate: OnUpdateFunc): void => {
		this.notify(onUpdate);
	}
};

//+--------------------------\--------------------------------
//|	   ChildAddedNotifier    |
//\--------------------------/
//	Notifies of each individual child of node added
//\-----------------------------------------------------------
class ChildAddedNotifier extends Notifier {
	protected data: any = [];

	catchUp = (onUpdate: OnUpdateFunc): void => {
		for (const element of this.data)
			onUpdate(element);
	}
	update = (data: any): void => {
		this.data.push(data);

		if (!this.hasBeenUpdated)
			this.hasBeenUpdated = true;

		this.notifyAll();
	}
	notify = (onUpdate: OnUpdateFunc): void => {
		onUpdate(this.data[this.data.length - 1]);
	}
};

export { ValueNotifier, ChildAddedNotifier };
export type { OnUpdateFunc, UnregisterFunc };