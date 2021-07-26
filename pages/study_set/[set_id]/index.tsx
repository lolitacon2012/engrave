import { useRouter } from 'next/router'
export default function Study () {
    const router = useRouter();
    const { set_id } = router.query
    return <h1>{set_id}</h1>
}