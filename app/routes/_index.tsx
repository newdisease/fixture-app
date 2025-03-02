import { redirect } from '@remix-run/node'

export async function loader() {
	return redirect('/feed')
}

export default function Index() {
	return null
}
