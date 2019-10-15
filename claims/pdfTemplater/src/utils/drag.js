const Drag = (el, elData, svg) => {
    const StartDrag = el => evt => {
        const box = el.getBoundingClientRect()
        const wiggleRoom = 5
        const onLeft = evt.clientX <= (box.left + wiggleRoom) && evt.clientX >= box.left
        const onRight = evt.clientX <= box.right && evt.clientX >= box.right - wiggleRoom
        const onEdgeX = onLeft || onRight

        el.DragData = {
            x: evt.clientX,
            y: evt.clientY,
            dragging: !onEdgeX,
            onLeft: onLeft
        }

        el.ownerDocument.addEventListener(`mousemove`, el._drag)
        el.ownerDocument.addEventListener(`mouseleave`, el._endDrag)
        el.ownerDocument.addEventListener(`mouseup`, el._endDrag)
    }

    const EndDrag = el => () => {
        el.ownerDocument.removeEventListener(`mousemove`, el._drag)
        el.ownerDocument.removeEventListener(`mouseleave`, el._endDrag)
        el.ownerDocument.removeEventListener(`mouseup`, el._endDrag)
    }

    const Dragging = el => evt => {
        evt.preventDefault()
        const box = el.getBoundingClientRect()
        const svgBox = svg.getBoundingClientRect()
        const viewBox = svg.getAttribute(`viewBox`).split(` `)
        const svgHeight = parseFloat(viewBox[3])
        const scale = svgHeight / svgBox.height

        const top = parseFloat(el.getAttributeNS(null, `y`) || 0)
        const left = parseFloat(el.getAttributeNS(null, `x`) || 0)

        const y = top - ((el.DragData.y - evt.clientY) * scale)
        const xDiff = (el.DragData.x - evt.clientX) * scale
        const x = left - xDiff


        el.DragData.y = evt.clientY
        el.DragData.x = evt.clientX

        if (el.DragData.dragging) {
            elData.x = x
            elData.y = y
        } else {
            const width = box.width * scale
            const w = width - (el.DragData.onLeft ? -xDiff : xDiff)
            elData.w = w

            if (el.DragData.onLeft) {
                elData.x = x
            }
        }
    }

    const startDrag = StartDrag(el)
    el._drag = Dragging(el)
    el._endDrag = EndDrag(el)
    el.addEventListener(`mousedown`, startDrag)
}

export default Drag