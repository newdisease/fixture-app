import { redirect } from 'react-router'

export async function loader() {
	return redirect('/feed')
}

export default function Index() {
	return null
}
