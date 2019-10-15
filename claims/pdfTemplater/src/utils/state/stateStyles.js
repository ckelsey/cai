import Subject from '../observe/subject'
import { FontFamilies } from '../pageHelpers'

const newStyles = s => {
    if (!s) { s = {} }

    const fontFamily = new Subject(s.fontFamily)
    const fontSize = new Subject(s.fontSize)
    const letterSpacing = new Subject(s.letterSpacing)
    const color = new Subject(s.color)

    const styles = {
        get fontFamily() { return fontFamily.value },
        set fontFamily(v) {
            if (FontFamilies.indexOf(v) === -1) { return }
            if (v === fontFamily.value) { return }
            fontFamily.next(v)
        },
        get fontSize() { return fontSize.value },
        set fontSize(v) {
            v = parseFloat(v)
            if (v === fontSize.value) { return }
            fontSize.next(v)
        },
        get letterSpacing() { return letterSpacing.value },
        set letterSpacing(v) {
            v = parseFloat(v)
            if (v === letterSpacing.value) { return }
            letterSpacing.next(v)
        },
        get color() { return color.value },
        set color(v) {
            if (typeof v !== `string`) { return }
            if (v === color.value) { return }
            color.next(v)
        }
    }

    return { fontFamily, fontSize, letterSpacing, color, styles }
}

export default newStyles