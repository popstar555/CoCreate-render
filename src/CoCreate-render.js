/**
 * change name Class
 * add functionality to add value on any attr of each elements into template
 */
const CoCreateRender = {

	__getValueFromObject : function(json, path) {
		try {
			if(typeof json == 'undefined' || !path)
				return false;
			let jsonData = json, subpath = path.split('.');
			
			for (let i = 0; i < subpath.length; i++) {
				jsonData = jsonData[subpath[i]];
				if (!jsonData) return false;
			}
			return jsonData;
		}catch(error){
			console.log("Error in getValueFromObject", error);
			return false;
		}
	},
	
	__getValue: function(data, attrValue) {
		let result = /{{\s*([\w\W]+)\s*}}/g.exec(attrValue);
		if (result) {
			return this.__getValueFromObject(data, result[1].trim());
		}
		return false;
		
	},
	
	__createObject: function (data, path) {
		try {
			if (!path) return data;
			
			let keys = path.split('.')
			let newObject = data;

			for (var  i = keys.length - 1; i >= 0; i--) {
				newObject = {[keys[i]]: newObject}				
			}
			return newObject;
			
		} catch (error) {
			console.log("Error in getValueFromObject", error);
			return false;
		}
	},
	
	setArray: function(template, data) {
		const type = template.getAttribute('data-render_array') || "data";
		const render_key = template.getAttribute('data-render_key') || type;
		const self = this;
		const arrayData = this.__getValueFromObject(data, type);
		if (type && Array.isArray(arrayData)) {
			arrayData.forEach((item) => {
				
				let cloneEl = template.cloneNode(true);
				cloneEl.classList.remove('template');
				cloneEl.classList.add('clone_' + type);
				
				let r_data = self.__createObject(item, render_key);

				self.setValue([cloneEl], r_data, cloneEl);
				template.insertAdjacentHTML('beforebegin', cloneEl.outerHTML);
			})
		}
	},
 
	setValue:function(els, data, passTo, template){
		if (!data) return;
		const that = this;
		Array.from(els).forEach(e => {
			let passId = e.getAttribute('data-pass_id');
			if (passTo && passId != passTo) {
				return;
			}
			Array.from(e.attributes).forEach(attr=>{
				let attr_name = attr.name.toLowerCase();
				let  isPass = false;
				let attrValue = attr.value;
				let variables = attrValue.match(/{{\s*(\S+)\s*}}/g);
				if (!variables) {
					return;
				}
				
				variables.forEach((attr) => {
					let value = that.__getValue(data, attr)
					if (value && typeof(value) !== "object") {
						isPass = true;
						attrValue = attrValue.replace(attr, value);
					}
				})
				if (isPass) {
					if(attr_name == 'value'){
						let tag = e.tagName.toLowerCase();
						switch (tag) {
							case 'input':
								 e.setAttribute(attr_name, attrValue);
							break;
							case 'textarea':
								e.setAttribute(attr_name, attrValue);
								e.textContent = attrValue;
							break;
							default:
								e.innerHTML =  attrValue;
						}
					}
					e.setAttribute(attr_name, attrValue);
				}
			});
			
			if(e.children.length > 0) {
				that.setValue(e.children, data, e)
				
				if (e.classList.contains('template')) {
					that.setArray(e, data);
				} 
			}
		});
	},
	
	render : function(selector, dataResult) {
		let template_div = document.querySelector(selector)
		if (Array.isArray(dataResult)) {
			template_div.setAttribute('data-render_array', 'test');
			this.setValue([template_div], {test: dataResult});
		} else {
			this.setValue(template_div.children, dataResult);
		}
	}

}