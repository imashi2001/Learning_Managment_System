import { Link } from "react-router-dom";

export default function Hero({ content, userName, colorScheme = "student" }) {
  // Define color schemes for different roles
  const colorSchemes = {
    student: {
      gradient: "from-blue-600 via-purple-600 to-indigo-800",
      textColor: "text-blue-100",
      textSecondary: "text-blue-200",
      buttonBg: "bg-white text-blue-600 hover:bg-blue-50",
      buttonOutline: "border-white text-white hover:bg-white hover:text-blue-600",
      statColor: "text-blue-200"
    },
    lecturer: {
      gradient: "from-green-600 via-teal-600 to-emerald-800",
      textColor: "text-green-100",
      textSecondary: "text-green-200",
      buttonBg: "bg-white text-green-600 hover:bg-green-50",
      buttonOutline: "border-white text-white hover:bg-white hover:text-green-600",
      statColor: "text-green-200"
    },
    admin: {
      gradient: "from-blue-700 via-blue-600 to-blue-800",
      textColor: "text-blue-100",
      textSecondary: "text-blue-200",
      buttonBg: "bg-white text-blue-600 hover:bg-blue-50",
      buttonOutline: "border-white text-white hover:bg-white hover:text-blue-600",
      statColor: "text-blue-200"
    }
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.student;

  return (
    <section className={`relative bg-gradient-to-br ${colors.gradient} text-white overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Welcome Message */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              {content.title}
            </h1>
            <p className={`text-xl md:text-2xl ${colors.textColor} mb-8 max-w-3xl mx-auto`}>
              {content.subtitle}
            </p>
            {userName && (
              <p className={`text-lg ${colors.textSecondary} mb-8`}>
                Hello, <span className="font-semibold">{userName}</span>!
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={content.primaryAction.link}
              className={`${colors.buttonBg} px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1`}
            >
              {content.primaryAction.text}
            </Link>
            <Link
              to={content.secondaryAction.link}
              className={`border-2 ${colors.buttonOutline} px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200`}
            >
              {content.secondaryAction.text}
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className={`text-3xl font-bold ${colors.statColor}`}>500+</div>
              <div className={colors.textColor}>Active Students</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${colors.statColor}`}>50+</div>
              <div className={colors.textColor}>Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${colors.statColor}`}>100+</div>
              <div className={colors.textColor}>Courses Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave SVG */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
          <path d="M0,0V46.29c47.79,22.2,103.59,8.19,156.40,25.66C217.19,72.43,272,90,327.67,90C381.4,90,435.22,72.43,489,46.29c53.78-26.14,107.56-8.19,156.40,25.66C698.22,72.43,752,90,806.67,90C860.4,90,914.22,72.43,968,46.29c53.78-26.14,107.56-8.19,156.40,25.66C1180.22,72.43,1234,90,1288.67,90c44.44,0,88.89-17.57,133.33-35.33V0Z"></path>
        </svg>
      </div>
    </section>
  );
}

