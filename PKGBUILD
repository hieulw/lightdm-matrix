# Maintainer: Murin Deventa <murindeventa@gmail.com>
_pkgname=lightdm-matrix
pkgname=lightdm-webkit2-theme-matrix-git
pkgver=VERSION
pkgrel=1
pkgdesc="A simple terminal style theme for lightdm-webkit2-greeter"
arch=('any')
url="https://github.com/ladyga14/lightdm-matrix"
license=('WTFPL')
depends=('lightdm-webkit2-greeter')
makedepends=('git')
source=("git+https://github.com/ladyga14/${_pkgname}.git")
md5sums=('SKIP')

pkgver() {
    cd "$srcdir/${_pkgname}"
    printf "r%s.%s" "$(git rev-list --count HEAD)" "$(git rev-parse --short HEAD)"
}

package() {
    install -dm755 "$pkgdir/usr/share/lightdm-webkit/themes/matrix"
    cp -r "$srcdir/${_pkgname}/"* "$pkgdir/usr/share/lightdm-webkit/themes/matrix/"
}
