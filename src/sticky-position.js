export default function({
	primary = null,
	placeholder = null,
	wrapper = null,
	computeWidth = true,
    stickyClass = null,
	parent = null
} = {}){
	let top = null;
	let isSticky = false;

	const nativeSupport = (function(){
		if (this.isSupported !== null) {
			return this.isSupported;
		} else {
			const style = document.createElement('test').style;
			style.cssText = ['-webkit-', '-ms-', ''].map(prefix => `position: ${prefix}sticky`).join(';');
			this.isSupported = style.position.indexOf('sticky') !== -1;
			return this.isSupported;
		}
	}).bind({isSupported: null});

	function stick() {
		if (isSticky === true) return;
		primary.style.position = 'fixed';
		isSticky = true;

        if (stickyClass) {
            if (primary.classList) {
                primary.classList.add(stickyClass);
            } else {
                primary.className = `${primary.className} ${stickyClass}`;
            }
        }
	}

	function unstick() {
		if (isSticky === false) return;
		primary.style.position = 'relative';
		primary.style.width = '';
		primary.style.top = '';
		primary.style.left = '';
		placeholder.style.height = '';
		placeholder.style.width = '';
		isSticky = false;

        if (stickyClass) {
            if (primary.classList) {
                primary.classList.remove(stickyClass);
            } else {
                primary.className = primary.className.replace(stickyClass, '');
            }
        }
	}

	function init() {
		// positioning necessary for getComputedStyle to report the correct z-index value.
		wrapper.style.position = 'relative';

		const style = window.getComputedStyle(wrapper, null);

		top = parseInt(style.top) || 0;
		primary.style.zIndex = style.zIndex;
		primary.style.position = 'relative';
		wrapper.style.top = 0;
		// Giving the placeholder an overflow of 'hidden' or 'auto' will allow it to clear any bottom margin extending beneath the primary element.
		// Clearing that margin is needed so that it's contribution to the wrapper element's height can be measured with getBoundingClientRect.
		placeholder.style.overflow = 'hidden';

		update();
		window.addEventListener('load', update);
		window.addEventListener('scroll', update);
		window.addEventListener('resize', update);
	}

	function update() {
		const rect = wrapper.getBoundingClientRect();
		let parentBottom = 0;

		if (parent) {
			let parentRect = parent.getBoundingClientRect();
			parentBottom = parentRect.bottom - rect.height;
		} else {
			parentBottom = document.body.clientHeight;
		}

		const sticky = rect.top < top && parentBottom > top;

		if (sticky) {
			placeholder.style.height = rect.height + 'px';

			if (computeWidth) {
				placeholder.style.width = rect.width + 'px';
			}

			var parentRect = wrapper.parentNode.getBoundingClientRect();

			primary.style.top = Math.min(parentRect.top + parentRect.height - rect.height, top) + 'px';
			primary.style.width = computeWidth ? rect.width+'px' : '100%';
			primary.style.left = rect.left + 'px';

			stick();
		} else {
			unstick();
		}
	}

	function destroy() {
		window.removeEventListener('load', update);
		window.removeEventListener('scroll', update);
		window.removeEventListener('resize', update);
		unstick();
	}

	if (nativeSupport()) {
		return {
			update(){},
			destroy(){}
		};
	} else {
		init();

		return {
			update,
			destroy,
		};
	}
}
