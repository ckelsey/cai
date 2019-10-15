export const validFile = (files, type) => {
    const hasFile = !!files && files.length
    const rightType = !hasFile ?
        false :
        Array.isArray(type) ?
        type.indexOf(files[0].type) > -1 :
        files[0].type === type
    return hasFile && rightType
}