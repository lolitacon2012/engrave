

const MorphologyCard = (props: { title?: string, id?: string }) => {
    if (!props?.id) {
        return <div style={{ width: 240, height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', border: "2px dashed var(--cafe-grey)" }}>
            <h1>+</h1>
        </div>
    }
    return <div style={{ width: 240, height: 120, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--cafe-1)' }}>
        <h1>{props.title}</h1>
    </div>
}
export default MorphologyCard;