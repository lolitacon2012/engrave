import { useRouter } from 'next/router'
const Dictionary = () => {
    const router = useRouter();
    const { set_id } = router.query
    return <h1>{set_id} dic dic</h1>
}

export default Dictionary;