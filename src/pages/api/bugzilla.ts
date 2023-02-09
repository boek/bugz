import { NextApiRequest, NextApiResponse } from 'next'

interface ExtendedNextApiRequest extends NextApiRequest {
	body: {
		bugId: number;
		whiteboard: string;
	};
}


export default async function handler(req: ExtendedNextApiRequest, res: NextApiResponse) {
	// const result = await fetch(`https://bugzilla.mozilla.org/rest/bug/${req.body.bugId}`, {
	// 	method: 'PUT',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 		'X-BUGZILLA-API-KEY': '<apikey>'
	// 	},
	// 	body: JSON.stringify({ whiteboard: req.body.whiteboard })
	// })

	console.log(req.body)
	res.status(200).json({ success: true })
}
