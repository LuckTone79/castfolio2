import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-500 mb-6">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
