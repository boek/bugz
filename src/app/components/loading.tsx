export const Loading = () => (
	<div>
		<ul className="grid grid-cols-2">
			{[...Array(20)].map((_, i) => <CardSkeleton key={i} />)}
		</ul>
	</div>
)

export const CardSkeleton = () => (
	<li>
		<div
			className="p-2 bg-white/25 backdrop-blur-sm border border-white/20 rounded-lg m-2 shadow-sm cursor-pointer max-w-md">
			<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>

			<div className="flex items-center">
				<div className="h-2 w-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>
				<div className="h-2 w-40 ml-2 bg-gray-200 rounded-full dark:bg-gray-700"></div>
			</div>
		</div>
	</li>
)

export default Loading
