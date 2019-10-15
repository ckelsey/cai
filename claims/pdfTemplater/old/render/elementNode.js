const elementNode = methods => item => methods.getIframeDoc(document.getElementById(item.parentId)).getElementById(item.id)
export default elementNode